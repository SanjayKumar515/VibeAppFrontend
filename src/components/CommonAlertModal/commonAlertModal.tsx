import React, { createContext, useContext, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Button, TextView } from '../index';
import Modal from 'react-native-modal';
import getStyles from './styles';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTheme } from '../../theme/ThemeContext';

interface ModalProps {
  showAlert: (
    modalTitle: string,
    modalText: string,
    modalActionButtonText: string,
    modalActionPress: () => void,
    modalType?: string,
    modalCancelButtonText?: string,
    modalCancelPress?: () => void,
  ) => void;
  hideAlert: () => void;
}

const ModalContext = createContext<ModalProps | undefined>(undefined);

export const CommonAlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //Class States
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState('');

  const { colors } = useTheme();
  const styles = getStyles(colors);

  //Update States When Modal is Shown
  const [modalTitle, setModalTitle] = useState('');
  const [modalText, setModalText] = useState('');
  const [modalActionButtonText, setModalActionButtonText] = useState('');
  const [modalActionPress, setModalActionPress] = useState<
    (() => void) | undefined
  >(undefined);
  const [modalCancelButtonText, setModalCancelButtonText] = useState('');
  const [modalCancelPress, setModalCancelPress] = useState<
    (() => void) | undefined
  >(undefined);

  const showAlert = (
    modalTitle: string,
    modalText: string,
    modalActionButtonText: string = '',
    modalActionPress: () => void = () => {},
    modalType?: string,
    modalCancelButtonText: string = '',
    modalCancelPress: () => void = () => {},
  ) => {
    setModalTitle(modalTitle);
    setModalText(modalText);
    setModalActionButtonText(modalActionButtonText);
    setModalActionPress(() => modalActionPress);
    setModalCancelButtonText(modalCancelButtonText);
    setModalCancelPress(() => modalCancelPress);
    switch (modalType) {
      case 'confirm':
        setTimeout(() => {
          setModalShow(true);
          setModalType('confirm');
        }, 500);
        break;
      case 'internet':
        setTimeout(() => {
          setModalShow(true);
          setModalType('internet');
        }, 500);
        break;
      default:
        setTimeout(() => {
          setModalShow(true);
          setModalType('');
        }, 500);
        break;
    }
  };

  const hideAlert = () => {
    setModalShow(false);
  };

  return (
    <ModalContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal isVisible={modalShow}>
        <View style={styles.modalViewContainer}>
          <View style={styles.modalView}>
            <TextView style={styles.modalTitleText}>
              {modalTitle || 'Something went wrong'}
            </TextView>
            <TextView style={styles.modalText}>{modalText}</TextView>
            {/* Action Button */}
            <View style={[styles.actionButtonView]}>
              <Button
                title={modalActionButtonText}
                buttonColor={colors.PRIMARY[300]}
                style={{ width: wp(35) }}
                onPress={modalActionPress}
                textColor={colors.PRIMARY[100]}
              />
            </View>
            {/* Cancel & Go Back Button Show Only When Modal Type is Confirmation */}
            {modalType === 'confirm' && (
              <View style={styles.cancelButtonView}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => hideAlert()}
                >
                  <TextView style={styles.caneclButtonText}>
                    {modalCancelButtonText}
                  </TextView>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ModalContext.Provider>
  );
};

export const CommonAlertModal = (): ModalProps => {
  const modalContext = useContext(ModalContext);
  if (!modalContext) {
    throw new Error('CommonAlert must be used within a ModalProvider');
  }
  return modalContext;
};
