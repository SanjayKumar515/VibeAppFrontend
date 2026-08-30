import { StyleSheet } from 'react-native';
import { Fonts } from '../../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    color: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    color: '#000000',
    marginBottom: 16,
  },
  myStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  myStatusImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00a884',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  addIcon: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: 'bold',
  },
  statusTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: '#000000',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: '#667781',
  },
  recentUpdatesText: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    color: '#667781',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statusItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusRing: {
    borderWidth: 2,
    borderRadius: 30,
    padding: 2,
    marginRight: 12,
  },
});

export default styles;
