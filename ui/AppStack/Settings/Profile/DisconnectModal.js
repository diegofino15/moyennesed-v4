import { View, Text, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react-native";

import CustomConfirmModal from "../../../components/CustomConfirmModal";


// Disconnect modal
function DisconnectModal({ isDisconnecting, setIsDisconnecting, disconnect }) {
  return (
    <CustomConfirmModal
      visible={isDisconnecting}
      exitModal={() => setIsDisconnecting(false)}
      children={[
        (<View key={2} style={{
          backgroundColor: DefaultTheme.colors.surface,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.error,
          padding: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={DefaultTheme.fonts.titleSmall}>Voulez-vous vraiment vous déconnecter ?</Text>
          <Text style={DefaultTheme.fonts.labelMedium}>Toutes vos données et préférences seront effacées, pas de retour en arrière.</Text>
        </View>),
        (<PressableScale key={3} onPress={disconnect} style={{
          backgroundColor: DefaultTheme.colors.error,
          padding: 10,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}>
          <View style={{ width: 30 }}/>
          <Text style={[DefaultTheme.fonts.bodyLarge, { color: 'white', height: 23 }]}>Se déconnecter</Text>
          <ChevronRightIcon size={30} color={'white'}/>
        </PressableScale>)
      ]}
    />
  );
}

export default DisconnectModal;