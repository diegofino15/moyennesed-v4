import { useState, useEffect } from "react";
import { Text, ActivityIndicator, View, Dimensions, ScrollView, RefreshControl, Platform } from "react-native";
import { AlertTriangleIcon, RefreshCcwIcon, ChevronLeftIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import HomeworkDay from "./HomeworkDay";
import CustomSeparator from "../../../components/CustomSeparator";
import CustomInformationCard from "../../../components/CustomInformationCard";
import HapticsHandler from "../../../../util/HapticsHandler";
import AppData from "../../../../core/AppData";


// Exam page
function HomeworksPage({ isConnected, isConnecting, globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { accountID } = route.params;

  // Get abstract exams (waiting for them to load)
  const [abstractHomeworks, setAbstractHomeworks] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        let newAbstractExams = {};
        Object.keys(cacheData[accountID].data.days).map(day => {
          newAbstractExams[day] = cacheData[accountID].data.days[day].map(examID => cacheData[accountID].data.homeworks[examID]);
        });
        setAbstractHomeworks(newAbstractExams);
      }
    });
  }, [globalDisplayUpdater]);

  // Refresh next exams
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
      <ScrollView style={{
        backgroundColor: DefaultTheme.colors.backdrop,
        padding: 20,
        height: Dimensions.get('window').height - Constants.statusBarHeight - 50,
        overflow: 'visible',
        zIndex: 0,
      }} refreshControl={(
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshNextExams}
          tintColor={DefaultTheme.colors.onBackground}
        />
      )} showsVerticalScrollIndicator={false}>
        {errorGettingHomework && (
          <CustomInformationCard
            icon={<AlertTriangleIcon size={25} color={DefaultTheme.colors.error}/>}
            title={"Une erreur s'est produite"}
            description={"Impossible de récupérer les devoirs, vérifiez votre connexion internet."}
            error
            style={{ marginBottom: 30 }}
          />
        )}

        {Object.keys(abstractHomeworks).map((day, index) => (
          <View key={day}>
            <HomeworkDay
              accountID={accountID}
              day={day}
              exams={abstractHomeworks[day]}
              canLoad={isConnected && !isConnecting}
              windowWidth={Dimensions.get('window').width}
            />
            {index != Object.keys(abstractHomeworks).length - 1 ? (
              <CustomSeparator style={{
                backgroundColor: DefaultTheme.colors.surfaceOutline,
                left: -10,
                width: Dimensions.get('window').width - 20,
                marginVertical: 30,
              }}/>
            ) : <View style={{ height: 100 }}/>}
          </View>
        ))}
      </ScrollView>

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
        <Text style={[DefaultTheme.fonts.titleSmall, { height: 26 }]}>Prochains devoirs</Text>

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