import { View, Text } from "react-native";
import { ChevronRightIcon } from "lucide-react-native";

import CustomConfirmModal from "../../../components/CustomConfirmModal";
import CustomButton from "../../../components/CustomButton";
import { useGlobalAppContext } from "../../../../src/util/GlobalAppContext";


// Disconnect modal
function DisconnectModal({ isDisconnecting, setIsDisconnecting, disconnect }) {
  const { theme } = useGlobalAppContext();
  
  return (
    <CustomConfirmModal
      visible={isDisconnecting}
      exitModal={() => setIsDisconnecting(false)}
      children={[
        (<View key={2} style={{
          backgroundColor: theme.colors.surface,
          borderWidth: 2,
          borderColor: theme.colors.error,
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 10,
          marginBottom: 10,
        }}>
          <Text style={theme.fonts.titleSmall}>Voulez-vous vraiment vous déconnecter ?</Text>
          <Text style={theme.fonts.labelMedium}>Toutes vos données et préférences seront effacées, pas de retour en arrière.</Text>
        </View>),
        (<CustomButton
          key={3}
          title={<Text style={[theme.fonts.bodyLarge, { color: 'white', height: 25 }]}>Se déconnecter</Text>}
          onPress={disconnect}
          rightIcon={<ChevronRightIcon size={30} color={'white'}/>}
          style={{
            backgroundColor: theme.colors.error,
            paddingVertical: 10,
          }}
        />)
      ]}
    />
  );
}

export default DisconnectModal;