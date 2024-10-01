import { View, Text, FlatList } from "react-native";
import { PressableScale } from "react-native-pressable-scale";

import CustomSeparator from "../../components/CustomSeparator";
import HapticsHandler from "../../../core/HapticsHandler";
import AppData from "../../../core/AppData";
import { useGlobalAppContext } from "../../../util/GlobalAppContext";
import { useCurrentAccountContext } from "../../../util/CurrentAccountContext";


// Child chooser
function ChildChooser() {
  const { theme } = useGlobalAppContext();
  const { accountID, setShowMarksAccount, mainAccount } = useCurrentAccountContext();
  
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
                if (accountID != item) {
                  setShowMarksAccount(childAccount);
                  AppData.setSelectedChildAccount(childAccount.id);
                  HapticsHandler.vibrate("light");
                }
              }}
            >
              <View style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: accountID == item ? theme.colors.primary : theme.colors.background,
                borderRadius: 10,
              }}>
                <Text style={[
                  theme.fonts.labelLarge,
                  { color: accountID == item ? theme.colors.onPrimary : theme.colors.onSurfaceDisabled, height: 25 }
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