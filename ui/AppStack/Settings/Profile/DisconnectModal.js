import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { ChevronRightIcon } from "lucide-react-native";

import CustomConfirmModal from "../../../components/CustomConfirmModal";
import CustomButton from "../../../components/CustomButton";


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
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={DefaultTheme.fonts.titleSmall}>Voulez-vous vraiment vous déconnecter ?</Text>
          <Text style={DefaultTheme.fonts.labelMedium}>Toutes vos données et préférences seront effacées, pas de retour en arrière.</Text>
        </View>),
        (<CustomButton
          key={3}
          title={<Text style={[DefaultTheme.fonts.bodyLarge, { color: 'white', height: 23 }]}>Se déconnecter</Text>}
          onPress={disconnect}
          rightIcon={<ChevronRightIcon size={30} color={'white'}/>}
          style={{
            backgroundColor: DefaultTheme.colors.error,
            paddingVertical: 10,
          }}
        />)
      ]}
    />
  );
}

export default DisconnectModal;