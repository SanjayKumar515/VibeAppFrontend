import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RTCView, mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { socketService } from '../../../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const CallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { targetUserId, targetName, isCaller, isVideo = true, incomingSignal } = route.params as any;
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<any>(null);

  useEffect(() => {
    const setupWebrtc = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          if (
            granted['android.permission.CAMERA'] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.error('Camera or Mic permission denied');
            return;
          }
        }

        InCallManager.start({ media: isVideo ? 'video' : 'audio' });
        // Set speakerphone on for video calls, off for audio calls
        InCallManager.setForceSpeakerphoneOn(isVideo);

        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: isVideo,
        });
        setLocalStream(stream);
        localStreamRef.current = stream;

        const peerConnection = new RTCPeerConnection(configuration);
        pc.current = peerConnection;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track: any) => {
          peerConnection.addTrack(track, stream);
        });

        // Listen for remote track
        peerConnection.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socketService.emit('iceCandidate', {
              to: targetUserId,
              candidate: event.candidate,
              from: currentUser?.id,
            });
          }
        };

        if (isCaller) {
          // Caller creates offer
          const offer = await peerConnection.createOffer({});
          await peerConnection.setLocalDescription(offer);
          socketService.emit('callUser', {
            userToCall: targetUserId,
            signalData: offer,
            from: currentUser?.id,
            name: currentUser?.name,
            avatar: currentUser?.avatar
          });
        } else {
          // Receiver sets remote description and creates answer
          if (incomingSignal) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingSignal));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketService.emit('answerCall', {
              to: targetUserId,
              signal: answer
            });
          }
        }
      } catch (err) {
        console.error('Failed to setup WebRTC', err);
      }
    };

    setupWebrtc();

    // Socket listeners for signaling
    const handleCallAccepted = async (data: any) => {
      if (pc.current && data.signal) {
        await pc.current.setRemoteDescription(new RTCSessionDescription(data.signal));
      }
    };

    const handleIceCandidate = async (data: any) => {
      if (data.from === currentUser?.id) return;
      if (pc.current && data.candidate) {
        await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    const handleEndCall = () => {
      cleanup();
      navigation.goBack();
    };

    socketService.on('callAccepted', handleCallAccepted);
    socketService.on('iceCandidate', handleIceCandidate);
    socketService.on('callEnded', handleEndCall);

    return () => {
      cleanup();
      socketService.off('callAccepted', handleCallAccepted);
      socketService.off('iceCandidate', handleIceCandidate);
      socketService.off('callEnded', handleEndCall);
    };
  }, []);

  const cleanup = () => {
    InCallManager.stop();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => track.stop());
      localStreamRef.current = null;
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  };

  const endCall = () => {
    socketService.emit('endCall', { to: targetUserId });
    cleanup();
    navigation.goBack();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track: any) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Video */}
      {remoteStream && remoteStream.getVideoTracks().length > 0 ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.remoteVideoPlaceholder}>
          <Text style={styles.placeholderText}>
            {remoteStream ? `${targetName} (Audio Call)` : `Calling ${targetName}...`}
          </Text>
        </View>
      )}

      {/* Local Video */}
      {localStream && localStream.getVideoTracks().length > 0 && isVideo && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
          zOrder={1}
        />
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
          <Icon name={isMuted ? 'mic-off' : 'mic'} size={28} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={endCall}>
          <Icon name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  localVideo: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 100,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallBtn: {
    backgroundColor: '#ff4444',
  },
});

export default CallScreen;
