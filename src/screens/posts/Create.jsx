// Import component React Native
import {
  View,
  Text,
  TextInput,
  Button,
  ToastAndroid,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';

// Import React dan useState
import React, {useState} from 'react';

// Import React Native Image Picker
import {launchImageLibrary} from 'react-native-image-picker';

// Import API
import Api from '../../services/api';

// Import style
import styles from '../../styles';

// Import handler error
import {handleErrors} from '../../utils/handleErrors';

export default function PostCreate({navigation}) {
  // State form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Memilih gambar dari galeri
  const handleChoosePhoto = async () => {
    try {
      console.log('Tombol Choose Image diklik');

      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
      });

      console.log('Image Picker response:', response);

      // Jika pengguna membatalkan pemilihan gambar
      if (response.didCancel) {
        console.log('Pemilihan gambar dibatalkan');
        return;
      }

      // Jika terjadi error
      if (response.errorCode) {
        const message =
          response.errorMessage || 'Gagal membuka galeri gambar';

        console.log('Image Picker Error:', response.errorCode, message);

        Alert.alert(
          'Gagal Membuka Galeri',
          `${message}\n\nKode error: ${response.errorCode}`,
        );
        return;
      }

      // Jika gambar berhasil dipilih
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);

        setErrors(previous => ({
          ...previous,
          image: null,
        }));

        ToastAndroid.show(
          'Gambar berhasil dipilih!',
          ToastAndroid.SHORT,
        );
      } else {
        console.log('Tidak ada gambar yang dipilih');
      }
    } catch (error) {
      console.log('Error saat membuka galeri:', error);

      Alert.alert(
        'Terjadi Kesalahan',
        error.message || 'Tidak dapat membuka galeri. Periksa terminal.',
      );
    }
  };

  // Menyimpan post
  const storePost = async () => {
    setErrors({});

    // Validasi sederhana
    if (!title.trim() || !content.trim()) {
      setErrors({
        title: !title.trim() ? 'Title wajib diisi.' : null,
        content: !content.trim() ? 'Content wajib diisi.' : null,
      });
      return;
    }

    const formData = new FormData();

    formData.append('title', title);
    formData.append('content', content);

    // Lampirkan gambar jika ada
    if (image?.uri) {
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `photo_${Date.now()}.jpg`,
      });
    }

    try {
      setLoading(true);

      const response = await Api.post('/api/posts', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post berhasil dibuat:', response.data);

      ToastAndroid.show(
        'Post Created Successfully!',
        ToastAndroid.LONG,
      );

      navigation.push('PostIndex');
    } catch (error) {
      console.log(
        'Gagal menyimpan post:',
        error.response?.data || error.message,
      );

      if (error.response?.data) {
        handleErrors(error.response.data, setErrors);
      } else {
        Alert.alert(
          'Gagal Menyimpan',
          `Tidak dapat terhubung ke server.\n${error.message}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Tombol pilih gambar */}
        <View style={styles.upload}>
          <Button
            title="Choose Image"
            color="gray"
            onPress={handleChoosePhoto}
          />
        </View>

        {/* Preview gambar */}
        {image?.uri && (
          <View style={{marginVertical: 15, alignItems: 'center'}}>
            <Image
              source={{uri: image.uri}}
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
              }}
              resizeMode="cover"
            />

            <Text style={{marginTop: 8, color: 'green'}}>
              Gambar berhasil dipilih
            </Text>

            <TouchableOpacity
              onPress={() => setImage(null)}
              style={{marginTop: 8}}>
              <Text style={{color: 'red'}}>Hapus gambar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error gambar */}
        {errors?.image && (
          <Text style={styles.error}>
            {Array.isArray(errors.image)
              ? errors.image.join(', ')
              : errors.image}
          </Text>
        )}

        {/* Input title */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        {errors?.title && (
          <Text style={styles.error}>
            {Array.isArray(errors.title)
              ? errors.title.join(', ')
              : errors.title}
          </Text>
        )}

        {/* Input content */}
        <TextInput
          style={styles.textarea}
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {errors?.content && (
          <Text style={styles.error}>
            {Array.isArray(errors.content)
              ? errors.content.join(', ')
              : errors.content}
          </Text>
        )}

        {/* Tombol save */}
        <View style={{padding: 10}}>
          <TouchableOpacity
            style={styles.button}
            onPress={storePost}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'SAVING...' : 'SAVE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
