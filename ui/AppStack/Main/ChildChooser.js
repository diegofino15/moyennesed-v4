import { View, Text, FlatList } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

import CustomSeparator from "../../../src/ui/components/CustomSeparator";
import HapticsHandler from "../../../src/core/HapticsHandler";
import AppData from "../../../src/core/AppData";
import { useGlobalAppContext } from "../../../src/util/GlobalAppContext";


// Child chooser
function ChildChooser({ mainAccount, showMarksAccount, setShowMarksAccount }) {
  const { theme } = useGlobalAppContext();
  
  return (
    <View style={{
      marginBottom: 20,
      marginHorizontal: 20,
    }}>
      <CustomSeparator style={{ marginBottom: 10 }}/>
      
      <FlatList
        horizontal={true}
        bounces={true}
        showsHorizontalScrollIndicator={false}
        data={Object.keys(mainAccount.children)}
        renderItem={({ item }) => {
          const childAccount = mainAccount.children[item];
          return (
            <PressableScale
              key={item}
              onPress={() => {
                if (showMarksAccount.id != item) {
                  setShowMarksAccount(childAccount);
                  AppData.setSelectedChildAccount(childAccount.id);
                  HapticsHandler.vibrate("light");
                }
              }}
            >
              <View style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: showMarksAccount.id == item ? theme.colors.primary : theme.colors.background,
                borderRadius: 10,
              }}>
                <Text style={[
                  theme.fonts.labelLarge,
                  { color: showMarksAccount.id == item ? theme.colors.onPrimary : theme.colors.onSurfaceDisabled, height: 25 }
                ]}>{childAccount.firstName}</Text>
              </View>
            </PressableScale>
          );
        }}
      />
      
      <CustomSeparator style={{ marginTop: 10 }}/>
    </View>
  );
}

export default ChildChooser;