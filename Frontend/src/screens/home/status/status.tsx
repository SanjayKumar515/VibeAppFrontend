import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './status.styles';

const mockStatuses = [
  { id: '1', name: 'Alice', time: '10 minutes ago', isRead: false },
  { id: '2', name: 'Bob', time: '1 hour ago', isRead: true },
];

const Status = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Updates</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>

        {/* My Status */}
        <TouchableOpacity style={styles.myStatusContainer}>
          <View style={styles.myStatusImageContainer}>
            <View style={styles.placeholderImage} />
            <View style={styles.addIconContainer}>
              <Text style={styles.addIcon}>+</Text>
            </View>
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.nameText}>My status</Text>
            <Text style={styles.timeText}>Tap to add status update</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.recentUpdatesText}>Recent updates</Text>

      <FlatList
        data={mockStatuses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.statusItemContainer}>
            <View
              style={[
                styles.statusRing,
                { borderColor: item.isRead ? '#d3d3d3' : '#00a884' },
              ]}
            >
              <View style={styles.placeholderImage} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default Status;
