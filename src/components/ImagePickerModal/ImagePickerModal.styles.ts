import {
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Fonts } from '../../constant';

const styles = StyleSheet.create( {
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    paddingHorizontal: wp( 4 ),
    paddingBottom: hp( 4 ),
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: wp( 5 ),
    marginBottom: hp( 2 ),
    overflow: 'hidden',
  } as ViewStyle,
  option: {
    paddingVertical: hp( 2 ),
    alignItems: 'center',
  } as ViewStyle,
  optionText: {
    fontFamily: Fonts.Medium,
    fontSize: wp( 4.2 ),
    color: '#008B8B',
  } as TextStyle,
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  cancelContainer: {
    backgroundColor: '#fff',
    borderRadius: wp( 5 ),
    paddingVertical: hp( 2 ),
    alignItems: 'center',
  } as ViewStyle,
  cancelText: {
    fontFamily: Fonts.Medium,
    fontSize: wp( 4.2 ),
    color: '#008B8B',
  } as TextStyle,
} );


export default styles