import { useEffect, useState } from "react";
import { View, Text, Platform, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { Users2Icon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import ColorsHandler from "../../../../core/ColorsHandler";
import { formatMark } from "../../../../util/Utils";


// Mark page
function MarkPage({ globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { accountID, cacheMark } = route.params;

  // Auto-refresh info
  const [mark, setMark] = useState(cacheMark);
  useEffect(() => {
    AsyncStorage.getItem("marks").then((data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        setMark(cacheData[accountID].data[mark.periodID].marks[mark.id]);
      }
    });
  }, [globalDisplayUpdater]);

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);

  const [windowWidth, setWindowWidth] = useState(Platform.isPad ? 0 : Dimensions.get('window').width);
  
  return (
    <CustomModal
      goBackFunction={() => navigation.goBack()}
      titleStyle={{ color: 'black' }}
      headerStyle={{ backgroundColor: dark }}
      goBackButtonStyle={{ opacity: 0.6 }}
      style={{ paddingVertical: 0 }}
      setWidth={setWindowWidth}
      title={"Détails de la note"}
      children={(
        <View style={{ backgroundColor: DefaultTheme.colors.backdrop }}>
          {/* Top portion */}
          <View>
            {/* Mark value */}
            <View style={{
              marginTop: 20,
              alignItems: "center",
              justifyContent: 'center',
              width: windowWidth - 40,
              height: 80,
              marginBottom: 10,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[DefaultTheme.fonts.headlineLarge, {
                  fontSize: 45,
                }]}>{mark.valueStr}</Text>
                <Text style={[DefaultTheme.fonts.headlineMedium, {
                  color: DefaultTheme.colors.onSurfaceDisabled,
                  bottom: -15,
                }]}>/{`${mark.valueOn}`.replace(".", ",")}</Text>
              </View>
            </View>

            {/* Class value */}
            {mark.classValue && (
              <View style={{
                position: "absolute",
                top: 10,
                right: -10,
                flexDirection: "row",
                alignItems: "center",
              }}>
                <PressableScale style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 5,
                  backgroundColor: dark,
                  flexDirection: "row",
                  alignItems: "center",
                }}>
                  <Users2Icon size={20} color={"black"}/>
                  <Text style={[DefaultTheme.fonts.headlineMedium, {
                    color: "black",
                    fontSize: 17,
                    height: 22,
                    top: Platform.select({ ios: 1, android: -2 }),
                  }]}> : {formatMark(mark, true)}</Text>
                </PressableScale>
              </View>
            )}
          </View>

          {/* Actual page */}
          <View style={{
            marginTop: 10,
            backgroundColor: DefaultTheme.colors.backdrop,
            padding: 20,
            paddingTop: 0,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
            borderRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomWidth: 0,
            width: windowWidth + 4,
            left: -22,
          }}>
            <Text style={[DefaultTheme.fonts.bodyLarge, {
              color: 'black',
              backgroundColor: dark,
              paddingHorizontal: 20,
              paddingVertical: 5,
              borderRadius: 5,
              overflow: 'hidden',
              textAlign: 'center',
              top: -10,
            }]}>{mark.title}</Text>
          </View>
        </View>
      )}
    />
  );
}

export default MarkPage;