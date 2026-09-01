import React, { createContext, useContext, useState } from "react";
import { View, Pressable } from "react-native";
import Button from "../Button/button";
import TextView from "../TextView/textView";
import Modal from "react-native-modal";
import getStyles from "./styles";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTheme } from "../../theme/ThemeContext";

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

export const CommonAlertProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("");

  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");
  const [modalActionButtonText, setModalActionButtonText] = useState("");

  const [modalActionPress, setModalActionPress] = useState<
    (() => void) | undefined
  >(undefined);

  const [modalCancelButtonText, setModalCancelButtonText] = useState("");

  const [modalCancelPress, setModalCancelPress] = useState<
    (() => void) | undefined
  >(undefined);

  const showAlert = (
    modalTitle: string,
    modalText: string,
    modalActionButtonText: string = "",
    modalActionPress: () => void = () => {},
    modalType: string = "",
    modalCancelButtonText: string = "",
    modalCancelPress: () => void = () => {},
  ) => {
    setModalTitle(modalTitle);
    setModalText(modalText);
    setModalActionButtonText(modalActionButtonText);

    setModalActionPress(() => modalActionPress);

    setModalCancelButtonText(modalCancelButtonText);
    setModalCancelPress(() => modalCancelPress);

    setModalType(modalType);
    setModalShow(true);
  };

  const hideAlert = () => {
    setModalShow(false);
  };

  return (
    <ModalContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      <Modal
        isVisible={modalShow}
        onBackdropPress={modalType === "confirm" ? undefined : hideAlert}
        onBackButtonPress={hideAlert}
      >
        <View style={styles.modalViewContainer}>
          <View style={styles.modalView}>
            {/* Title */}
            <TextView style={styles.modalTitleText}>
              {modalTitle || "Something went wrong"}
            </TextView>

            {/* Message */}
            <TextView style={styles.modalText}>{modalText}</TextView>

            {/* Delete / Action Button */}
            <View style={styles.actionButtonView}>
              <Button
                title={modalActionButtonText}
                buttonColor={colors.PRIMARY[300]}
                style={{ width: wp(35) }}
                onPress={modalActionPress}
                textColor={colors.PRIMARY[100]}
              />
            </View>

            {/* Cancel Button */}
            {modalType === "confirm" && (
              <View style={styles.cancelButtonView}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={modalCancelPress}
                >
                  <TextView style={styles.caneclButtonText}>
                    {modalCancelButtonText || "Cancel"}
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
    throw new Error(
      "CommonAlertModal must be used within a CommonAlertProvider",
    );
  }

  return modalContext;
};
