import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker';

import {
  pick,
  types,
  DocumentPickerResponse,
} from '@react-native-documents/picker';

type PickerSource = 'Camera' | 'Gallery' | 'Document';

type PickerResult = ImageOrVideo | ImageOrVideo[] | DocumentPickerResponse[];

export const CommonImagePicker = async (
  from: PickerSource,
  maxFiles: number = 1,
  multiple: boolean = false,
): Promise<PickerResult> => {
  try {
    // Document
    if (from === 'Document') {
      const result = await pick({
        allowMultiSelection: multiple,
        type: [types.allFiles],
      });

      return result;
    }

    // Camera
    if (from === 'Camera') {
      const image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: false,
        mediaType: 'photo',
      });

      return image;
    }

    // Gallery
    const result = await ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      multiple,
      maxFiles: multiple ? maxFiles : 1,
      mediaType: 'photo',
    });

    return result;
  } catch (error) {
    throw error;
  }
};
