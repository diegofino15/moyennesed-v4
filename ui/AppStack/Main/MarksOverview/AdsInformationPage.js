import { View } from "react-native";

import CustomModal from "../../../components/CustomModal";


// Ad information page
function AdsInformationPage({ navigation }) {
  return (
    <CustomModal
      goBackFunction={() => navigation.pop()}
      style={{ paddingVertical: 0 }}
      horizontalPadding={0}
      children={(
        <View>

        </View>
      )}
    />
  );
}

export default AdsInformationPage;