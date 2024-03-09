import { View, Text } from "react-native";
import { DefaultTheme } from "react-native-paper";

import CustomModal from "../../../../components/CustomModal";
import ColorsHandler from "../../../../../util/ColorsHandler";


// Mark page
function MarkPage({ navigation, route }) {
  const { accountID, mark } = route.params;
  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);
  
  return (
    <CustomModal
      goBackFunction={() => navigation.goBack()}
      titleStyle={{ color: 'black' }}
      headerStyle={{ backgroundColor: dark }}
      goBackButtonStyle={{ opacity: 0.6 }}
      title={"Détails de la note"}
      children={(
        <View>
          <Text style={DefaultTheme.fonts.labelLarge}>{mark.title}</Text>
        </View>
      )}
    />
  );
}

export default MarkPage;