import { useState, useEffect } from "react";
import { Text, ActivityIndicator, View, Platform, SectionList } from "react-native";
import { AlertTriangleIcon, FileDownIcon, RefreshCcwIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import HomeworkDay from "./HomeworkDay";
import CustomModal from "../../../components/CustomModal";
import CustomSeparator from "../../../components/CustomSeparator";
import HapticsHandler from "../../../../core/HapticsHandler";
import AppData from "../../../../core/AppData";
import { useGlobalAppContext } from "../../../../src/util/GlobalAppContext";
import { useAppStackContext } from "../../../../src/util/AppStackContext";


// Exam page
function UpcomingHomeworkPage({ isConnected, isConnecting, navigation, route }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  
  const { accountID, _errorGettingHomework } = route.params;

  // Get abstract homeworks (waiting for them to load)
  const [abstractHomeworks, setAbstractHomeworks] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        let newAbstractHomeworks = cacheData[accountID].data;
        Object.keys(cacheData[accountID].data.days).map(day => {
          newAbstractHomeworks.days[day] = cacheData[accountID].data.days[day].map(examID => cacheData[accountID].data.homeworks[examID]);
        });
        setAbstractHomeworks(newAbstractHomeworks);
      }
    });
  }, [globalDisplayUpdater]);

  // Refresh next homeworks
  const [refreshing, setRefreshing] = useState(false);
  const [errorGettingHomework, setErrorGettingHomework] = useState(_errorGettingHomework);
  async function refreshUpcomingHomework() {
    if (!isConnected || refreshing) { return; }
    
    HapticsHandler.vibrate("light");
    setRefreshing(true);
    const status = await AppData.getAllHomework(accountID);
    setErrorGettingHomework(status != 1);
    setRefreshing(false);
    updateGlobalDisplay();
    HapticsHandler.vibrate("light");
  }

  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  
  return (
    <CustomModal
      title={"Travail à faire"}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      setHeight={setWindowHeight}
      setWidth={setWindowWidth}
      rightIcon={(
        <View style={{ margin: 4.5, }}>
          {refreshing || isConnecting ? (
            <ActivityIndicator size={25} color={theme.colors.onSurface}/>
          ) : !isConnected ? (
            <AlertTriangleIcon size={25} color={theme.colors.error}/>
          ) : (
            <RefreshCcwIcon size={25} color={theme.colors.onSurface}/>
          )}
        </View>
      )}
      otherIcon={(
        <PressableScale style={{
          position: 'absolute',
          top: 15,
          right: 12 + 50,
          borderRadius: 10,
          zIndex: 1,
        }} onPress={() => navigation.navigate("FilesPage", { accountID })}>
          <BlurView style={{
            borderRadius: 10,
            overflow: "hidden",
            padding: 7,
          }} tint="dark" intensity={30}>
            <FileDownIcon size={25} color={theme.colors.onSurface}/>
          </BlurView>
        </PressableScale>
      )}
      rightIconStyle={{ top: 15, right: 15 }}
      showScrollView={false}
      children={(<></>)}
      rightIconOnPress={refreshUpcomingHomework}
      childrenOutsideScrollView={(
        <SectionList
          showsVerticalScrollIndicator={false}
          initialNumToRender={1}
          sections={Object.values(abstractHomeworks.weeks ?? {})}
          style={{
            backgroundColor: theme.colors.backdrop,
            padding: 20,
            overflow: Platform.select({ ios: 'visible', android: 'hidden' }),
            height: windowHeight - Constants.statusBarHeight - 67,
            width: windowWidth,
          }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 50 }}>
              <HomeworkDay
                accountID={accountID}
                day={item}
                homeworks={abstractHomeworks.days[item]}
                windowWidth={windowWidth}
                navigation={navigation}
              />
            </View>
          )}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section: { title } }) => (
            <BlurView style={{
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 10,
              overflow: 'hidden',
              backgroundColor: Platform.select({ android: theme.colors.backdrop }),
              marginVertical: 15,
              top: -15,
              alignSelf: 'center',
            }} tint={theme.dark ? "dark" : "light"} intensity={50}>
              <Text style={[theme.fonts.bodyLarge, { height: 25 }]}>{title}</Text>
            </BlurView>
          )}
          renderSectionFooter={() => (
            <CustomSeparator style={{
              backgroundColor: theme.colors.surfaceOutline,
              marginBottom: 15,
            }}/>
          )}
          ListFooterComponent={() => (
            <View style={{
              left: -10,
              width: windowWidth,
              height: 100,
              top: -20,
              backgroundColor: theme.colors.backdrop,
            }}/>
          )}
          ListEmptyComponent={() => (
            <View style={{
              marginBottom: 50, 
              marginTop: 200,
              alignItems: 'center'
            }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {errorGettingHomework && <AlertTriangleIcon size={25} color={theme.colors.error} style={{ marginRight: 5 }}/>}

                <Text style={theme.fonts.bodyLarge}>
                  {errorGettingHomework ? "Une erreur est survenue" : "Aucun devoir pour le moment"}
                </Text>
              </View>
              <Text style={theme.fonts.labelMedium}>{errorGettingHomework ? "Impossible de récupérer les devoirs" : "Vous n'avez aucun devoir à faire."}</Text>
            </View>
          )}
        />
      )}
    />
  );
}

export default UpcomingHomeworkPage;