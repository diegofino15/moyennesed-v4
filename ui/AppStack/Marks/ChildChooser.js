import { View, Text, FlatList } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";

import Separator from "../../components/Separator";
import HapticsHandler from "../../../core/HapticsHandler";
import AppData from "../../../core/AppData";


// Child chooser
function ChildChooser({ mainAccount, showMarksAccount, setShowMarksAccount }) {
  return (
    <View style={{
      marginBottom: 20,
    }}>
      <Separator style={{ marginBottom: 10 }}/>
      
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
                backgroundColor: showMarksAccount.id == item ? DefaultTheme.colors.primary : DefaultTheme.colors.background,
                borderRadius: 10,
              }}>
                <Text style={[
                  DefaultTheme.fonts.labelLarge,
                  { color: showMarksAccount.id == item ? DefaultTheme.colors.onPrimary : DefaultTheme.colors.onSurfaceDisabled }
                ]}>{childAccount.firstName}</Text>
              </View>
            </PressableScale>
          );
        }}
      />
      
      <Separator style={{ marginTop: 10 }}/>
    </View>
  );
}

export default ChildChooser;