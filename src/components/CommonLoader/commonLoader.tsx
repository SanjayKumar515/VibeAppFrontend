import React, { createContext, useRef, useContext, useState } from 'react';
import { ActivityIndicator, View, Modal, StyleSheet } from 'react-native';
import styles from './styles';
import { useTheme } from '../../theme/ThemeContext';

interface ModalProps {
  showLoader: () => void;
  hideLoader: () => void;
}

const ModalContext = createContext<ModalProps | undefined>(undefined);

export const CommonLoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //Class States
  const [modalShow, setModalShow] = useState(false);
  const { colors } = useTheme();

  const showLoader = () => {
    setModalShow(true);
  };

  const hideLoader = () => {
    setModalShow(false);
  };

  return (
    <ModalContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <Modal
        transparent={true}
        visible={modalShow}
        animationType="fade"
      >
        <View style={StyleSheet.flatten([styles.modalBackground, { backgroundColor: 'rgba(0,0,0,0.8)' }])}>
          <View style={styles.loaderView}>
            <ActivityIndicator
              style={{ width: '40%', height: '40%' }}
              size="large"
              color={colors.PRIMARY[400]}
            />
          </View>
        </View>
      </Modal>
    </ModalContext.Provider>
  );
};

export const CommonLoader = (): ModalProps => {
  const modalContext = useContext(ModalContext);
  if (!modalContext) {
    throw new Error('CommonLoader must be used within a ModalProvider');
  }
  return modalContext;
};
