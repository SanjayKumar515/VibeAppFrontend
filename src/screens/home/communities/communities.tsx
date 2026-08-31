import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../theme/ThemeContext';
import getStyles from './communities.styles';

const Communities = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://i.imgur.com/Kx2H5i6.png' }} // Placeholder for communities graphic
          style={styles.imagePlaceholder}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Introducing communities</Text>
        <Text style={styles.subtitle}>
          Easily organize your related groups and send announcements. Now, your communities, like neighborhoods or schools, can have their own space.
        </Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start your community</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Communities;
