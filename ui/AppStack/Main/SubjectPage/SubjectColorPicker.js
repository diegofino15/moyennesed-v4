import { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { TrashIcon } from "lucide-react-native";
import ColorPicker, { Preview, Panel1, HueSlider } from "reanimated-color-picker";

import CustomConfirmModal from "../../../../src/ui/components/CustomConfirmModal";
import ColorsHandler from "../../../../src/core/ColorsHandler";
import HapticsHandler from "../../../../src/core/HapticsHandler";
import { useGlobalAppContext } from "../../../../src/util/GlobalAppContext";
import { useAppStackContext } from "../../../../src/util/AppStackContext";

// Subject color picker
function SubjectColorPicker({
  subjectID,
  visible,
  exitModal,
  initialValue,
  windowWidth,
}) {
  const { theme } = useGlobalAppContext();
  const { updateGlobalDisplay } = useAppStackContext();
  
  const [color, setColor] = useState(initialValue);
  function onSelectColor({ hex }) {
    setColor(hex);
  }

  function validate() {
    if (color != initialValue) {
      ColorsHandler.setSubjectColor(subjectID, lightenColor(color, 40), color);
      updateGlobalDisplay();
      HapticsHandler.vibrate("light");
    }
    exitModal();
  }
  function reset() {
    ColorsHandler.removeSubjectColor(subjectID);
    updateGlobalDisplay();
    exitModal();
    HapticsHandler.vibrate("light");
  }
  function lightenColor(hex, percent) {
    // Remove '#' if present
    hex = hex.replace("#", "");

    // Parse hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Adjust RGB values to make the color lighter
    r = Math.floor((r * (100 + percent)) / 100);
    g = Math.floor((g * (100 + percent)) / 100);
    b = Math.floor((b * (100 + percent)) / 100);

    // Ensure values don't exceed 255
    r = r < 255 ? r : 255;
    g = g < 255 ? g : 255;
    b = b < 255 ? b : 255;

    // Convert RGB to hex
    let lighterHex = ((r << 16) | (g << 8) | b).toString(16);

    // Add leading zeros if necessary
    lighterHex = "#" + ("000000" + lighterHex).slice(-6);

    return lighterHex;
  }

  return (
    <CustomConfirmModal
      visible={visible}
      exitModal={exitModal}
      children={[
        <ColorPicker key={0} value={color} onComplete={onSelectColor}>
          <Preview style={{ marginBottom: 5 }} />
          <Panel1 style={{ marginBottom: 5 }} />
          <HueSlider />
        </ColorPicker>,

        <View
          key={1}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          {/* Reset color */}
          <PressableScale
            style={{
              backgroundColor: theme.colors.errorLight,
              borderWidth: 2,
              borderColor: theme.colors.error,
              borderRadius: 5,
              padding: 5,
            }}
            onPress={reset}
          >
            <TrashIcon size={25} color={theme.colors.error} />
          </PressableScale>

          {/* Validate color */}
          <PressableScale
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.primaryLight,
              borderWidth: 2,
              borderColor: theme.colors.primary,
              width: windowWidth - 90,
              padding: 5,
              borderRadius: 5,
              marginLeft: 10,
            }}
            onPress={validate}
          >
            <Text style={theme.fonts.bodyLarge}>Valider</Text>
          </PressableScale>
        </View>,
      ]}
    />
  );
}

export default SubjectColorPicker;
