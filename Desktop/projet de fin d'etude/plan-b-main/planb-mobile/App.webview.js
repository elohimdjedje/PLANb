// Plan B Mobile - Version WebView (backup)
// Cette version charge le frontend web dans une WebView
import React from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// ⚠️ IMPORTANT : Remplacez par votre adresse IP locale
const LOCAL_IP = '192.168.1.176';
const WEB_APP_URL = `http://${LOCAL_IP}:5173`;

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const webViewRef = React.useRef(null);

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Désolé, nous avons besoin des permissions pour accéder à vos photos !');
        }
      }
    })();
  }, []);

  const handleMessage = async (event) => {
    const message = JSON.parse(event.nativeEvent.data);
    
    if (message.type === 'SELECT_IMAGE') {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled) {
          const images = await Promise.all(
            result.assets.map(async (asset) => {
              const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              return {
                uri: asset.uri,
                base64: `data:image/jpeg;base64,${base64}`,
                name: asset.fileName || `photo_${Date.now()}.jpg`,
              };
            })
          );

          webViewRef.current?.postMessage(JSON.stringify({
            type: 'IMAGES_SELECTED',
            images,
          }));
        }
      } catch (error) {
        console.error('Erreur sélection image:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Chargement de Plan B...</Text>
          <Text style={styles.loadingSubtext}>{WEB_APP_URL}</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});
