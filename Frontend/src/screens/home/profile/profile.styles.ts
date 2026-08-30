import { StyleSheet } from 'react-native';
import { Fonts } from '../../../constant';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  allTextInputContainer: {
    marginTop: hp(15),
    width: wp(95),
    alignSelf: 'center',
  },
  loginLabel: {
    fontSize: 25,
    color: '#fff',
    left: wp(6),
    position: 'absolute',
    fontFamily: Fonts.Bold,
  },
  logoContainer: {
    justifyContent: 'center',
    marginTop: hp(15),
    alignItems: 'center',
  },
  logo: {
    width: wp(100),
    height: hp(30),
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  text: {
    fontSize: 20,
    color: '#fff',
  },
  label: {
    marginLeft: wp(6),
    marginBottom: hp(1),
    fontFamily: Fonts.SemiBold,
    fontSize: 14,
    color: '#fff',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    backgroundColor: '#2c9eaf',
    width: wp(85),
    alignSelf: 'center',
    marginBottom: hp(1),
  },
  input: {
    width: wp(70),
    fontSize: 14,
    color: '#fff',
    fontFamily: Fonts.SemiBold,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
});

export default styles;
