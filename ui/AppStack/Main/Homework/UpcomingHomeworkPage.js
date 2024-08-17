import { useState, useEffect } from "react";
import { Text, ActivityIndicator, View, Dimensions, RefreshControl, Platform, SectionList } from "react-native";
import { AlertTriangleIcon, RefreshCcwIcon, ChevronLeftIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import HomeworkDay from "./HomeworkDay";
import CustomSeparator from "../../../components/CustomSeparator";
import HapticsHandler from "../../../../core/HapticsHandler";
import AppData from "../../../../core/AppData";
import { useAppContext } from "../../../../util/AppContext";


// Exam page
function UpcomingHomeworkPage({ isConnected, isConnecting, globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { theme } = useAppContext();
  
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
    if (!isConnected) { return; }
    
    HapticsHandler.vibrate("light");
    setRefreshing(true);
    const status = await AppData.getAllHomework(accountID);
    setErrorGettingHomework(status != 1);
    setRefreshing(false);
    updateGlobalDisplay();
    HapticsHandler.vibrate("light");
  }

  // Load the homeworks one by one
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View style={{
      backgroundColor: theme.colors.backdrop,
    }}>
      <View style={{ height: Constants.statusBarHeight + 50 }}/>
      
      {/* Homeworks */}
      <SectionList
        showsVerticalScrollIndicator={false}
        initialNumToRender={1}
        sections={Object.values(abstractHomeworks.weeks ?? {})}
        refreshing={refreshing}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshUpcomingHomework}
            tintColor={theme.colors.onBackground}
          />
        )}
        style={{
          backgroundColor: theme.colors.backdrop,
          paddingVertical: 20,
          paddingHorizontal: 10,
          height: Dimensions.get('window').height - Constants.statusBarHeight - 50,
          overflow: 'visible',
          zIndex: 0,
        }}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 50 }}>
            <HomeworkDay
              accountID={accountID}
              day={item}
              homeworks={abstractHomeworks.days[item]}
              canAutoLoad={isConnected && !isConnecting}
              isCurrentIndex={index == currentIndex}
              markAsLoaded={() => setCurrentIndex(currentIndex + 1)}
              globalDisplayUpdater={globalDisplayUpdater}
              updateGlobalDisplay={updateGlobalDisplay}
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
            width: Dimensions.get('window').width,
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

      {/* Header */}
      <BlurView style={{
        position: 'absolute',
        width: Dimensions.get('window').width,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: Constants.statusBarHeight + 50,
        zIndex: 1,
      }} tint={theme.dark ? "light" : "dark"} intensity={50}>
        <Text style={[theme.fonts.titleSmall, { height: 26 }]}>Travail à faire</Text>

        {/* Go back button */}
        <PressableScale style={{
          position: 'absolute',
          left: 22.5,
          bottom: 10,
          borderWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          backgroundColor: theme.colors.surface,
          padding: 5,
          borderRadius: 10,
        }} onPress={() => navigation.pop()}>
          <ChevronLeftIcon size={30} color={theme.colors.onSurface}/>
        </PressableScale>

        {/* Refresh button */}
        <PressableScale style={{
          position: 'absolute',
          right: 22.5,
          bottom: 10,
          borderWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          backgroundColor: theme.colors.surface,
          padding: 5,
          borderRadius: 10,
        }} onPress={refreshUpcomingHomework}>
          {refreshing || isConnecting ? (
            <ActivityIndicator size={30} color={theme.colors.onSurface}/>
          ) : !isConnected ? (
            <AlertTriangleIcon size={25} color={theme.colors.error}/>
          ) : (
            <RefreshCcwIcon size={25} color={theme.colors.onSurface} style={{ margin: 2.5 }}/>
          )}
        </PressableScale>
      </BlurView>
    </View>
  );
}

export default UpcomingHomeworkPage;