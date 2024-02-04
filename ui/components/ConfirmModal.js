import { ChevronLeftIcon } from "lucide-react-native";
import { Modal, View } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { BlurView } from "expo-blur";


// Confirm modal
function ConfirmModal({
  visible,
  setVisible
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <BlurView intensity={50} tint="dark">

      </BlurView>
      
      
      <View style={{
        backgroundColor: "white",
        padding: 20,
        width: '100%',
        height: 200,
      }}>
        <PressableScale onPress={() => setVisible(false)} style={{
          backgroundColor: DefaultTheme.colors.surface,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          padding: 5,
          position: 'absolute',
          bottom: 10,
          left: 10,
          borderRadius: 5,
        }}>
          <ChevronLeftIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
        </PressableScale>
      </View>
    </Modal>
  );
}

export default ConfirmModal;