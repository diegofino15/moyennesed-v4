import { useState, useEffect } from "react";
import { Text, ActivityIndicator, View, Dimensions, RefreshControl, Platform, SectionList } from "react-native";
import { AlertTriangleIcon, RefreshCcwIcon, ChevronLeftIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import HomeworkDay from "./HomeworkDay";
import CustomSeparator from "../../../components/CustomSeparator";
import CustomInformationCard from "../../../components/CustomInformationCard";
import HapticsHandler from "../../../../core/HapticsHandler";
import AppData from "../../../../core/AppData";


// Exam page
function HomeworksPage({ isConnected, isConnecting, globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { accountID } = route.params;

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
  const [errorGettingHomework, setErrorGettingHomework] = useState(false);
  async function refreshNextExams() {
    if (!isConnected) { return; }
    
    HapticsHandler.vibrate("light");
    setRefreshing(true);
    setErrorGettingHomework((await AppData.getAllHomework(accountID)) != 1);
    setRefreshing(false);
    updateGlobalDisplay();
    HapticsHandler.vibrate("light");
  }

  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.backdrop,
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
            onRefresh={refreshNextExams}
            tintColor={DefaultTheme.colors.onBackground}
          />
        )}
        style={{
          backgroundColor: DefaultTheme.colors.backdrop,
          paddingVertical: 20,
          paddingHorizontal: 10,
          height: Dimensions.get('window').height - Constants.statusBarHeight - 50,
          overflow: 'visible',
          zIndex: 0,
        }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 50 }}>
            <HomeworkDay
              accountID={accountID}
              day={item}
              homeworks={abstractHomeworks.days[item]}
              canLoad={isConnected && !isConnecting}
              windowWidth={Dimensions.get('window').width}
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
            backgroundColor: Platform.select({ android: DefaultTheme.colors.backdrop }),
            marginVertical: 15,
            top: -15,
            alignSelf: 'center',
          }} tint="dark" intensity={50}>
            <Text style={[DefaultTheme.fonts.bodyLarge, { height: 25 }]}>{title}</Text>
          </BlurView>
        )}
        renderSectionFooter={() => (
          <CustomSeparator style={{
            width: '100%',
            backgroundColor: DefaultTheme.colors.surfaceOutline,
            marginBottom: 15,
          }}/>
        )}
        ListFooterComponent={() => (
          <View style={{
            left: -10,
            width: Dimensions.get('window').width,
            height: 100,
            top: -20,
            backgroundColor: DefaultTheme.colors.backdrop,
          }}/>
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
      }} tint="light" intensity={50}>
        <Text style={[DefaultTheme.fonts.titleSmall, { height: 26 }]}>Travail à faire</Text>

        {/* Go back button */}
        <PressableScale style={{
          position: 'absolute',
          left: 22.5,
          bottom: 10,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          backgroundColor: DefaultTheme.colors.surface,
          padding: 5,
          borderRadius: 10,
        }} onPress={() => navigation.pop()}>
          <ChevronLeftIcon size={30} color={DefaultTheme.colors.onSurface}/>
        </PressableScale>

        {/* Refresh button */}
        <PressableScale style={{
          position: 'absolute',
          right: 22.5,
          bottom: 10,
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          backgroundColor: DefaultTheme.colors.surface,
          padding: 5,
          borderRadius: 10,
        }} onPress={refreshNextExams}>
          {refreshing || isConnecting ? (
            <ActivityIndicator size={30} color={DefaultTheme.colors.onSurface}/>
          ) : !isConnected ? (
            <AlertTriangleIcon size={25} color={DefaultTheme.colors.error}/>
          ) : (
            <RefreshCcwIcon size={25} color={DefaultTheme.colors.onSurface} style={{ margin: 2.5 }}/>
          )}
        </PressableScale>
      </BlurView>
    </View>
  );
}

export default HomeworksPage;