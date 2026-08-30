import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import styles from './ImagePickerModal.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'Camera' | 'Gallery') => void;
}

const ImagePickerModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => onSelect('Camera')}
            >
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => onSelect('Gallery')}
            >
              <Text style={styles.optionText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cancelContainer} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ImagePickerModal;
