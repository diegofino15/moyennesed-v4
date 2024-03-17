import { useState, useEffect } from "react";
import { Text, ActivityIndicator, View, Dimensions, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultTheme } from "react-native-paper";
import { AlertTriangleIcon, RefreshCcwIcon, ChevronLeftIcon } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { PressableScale } from "react-native-pressable-scale";
import Constants from "expo-constants";

import HomeworkDay from "./HomeworkDay";
import CustomInformationCard from "../../../components/CustomInformationCard";
import CustomModal from "../../../components/CustomModal";
import AppData from "../../../../core/AppData";
import HapticsHandler from "../../../../util/HapticsHandler";
import CustomSeparator from "../../../components/CustomSeparator";


// Exam page
function HomeworksPage({ globalDisplayUpdater, updateGlobalDisplay, navigation, route }) {
  const { accountID } = route.params;

  // Get abstract exams (waiting for them to load)
  const [abstractHomeworks, setAbstractExams] = useState({});
  useEffect(() => {
    AsyncStorage.getItem("homework").then(data => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        let newAbstractExams = {};
        Object.keys(cacheData[accountID].data.days).map(day => {
          newAbstractExams[day] = cacheData[accountID].data.days[day].map(examID => cacheData[accountID].data.homeworks[examID]);
        });
        setAbstractExams(newAbstractExams);
      }
    });
  }, [globalDisplayUpdater]);

  // Refresh next exams
  const [refreshing, setRefreshing] = useState(false);
  const [errorGettingHomework, setErrorGettingHomework] = useState(false);
  async function refreshNextExams() {
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
      <BlurView style={{
        width: Dimensions.get('window').width,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: Constants.statusBarHeight + 50,
        zIndex: 1,
      }} tint="light" intensity={50}>
        <Text style={DefaultTheme.fonts.titleSmall}>Prochains devoirs</Text>

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
          {refreshing ? (
            <ActivityIndicator size={30} color={DefaultTheme.colors.onSurface}/>
          ) : (
            <RefreshCcwIcon size={25} color={DefaultTheme.colors.onSurface} style={{ margin: 2.5 }}/>
          )}
        </PressableScale>
      </BlurView>
      
      {/* Homeworks */}
      <ScrollView style={{
        backgroundColor: DefaultTheme.colors.backdrop,
        padding: 20,
        height: Dimensions.get('window').height - Constants.statusBarHeight - 150,
        overflow: 'visible',
        zIndex: 0,
      }}>
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
            />
            {index != Object.keys(abstractHomeworks).length - 1 && (
              <CustomSeparator style={{
                backgroundColor: DefaultTheme.colors.surfaceOutline,
                left: -10,
                width: Dimensions.get('window').width - 20,
                marginVertical: 30,
              }}/>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={{ backgroundColor: DefaultTheme.colors.backdrop, height: 100, zIndex: -1 }}/>
    </View>
    
    /*
    <CustomModal
      title={"Prochains devoirs"}
      goBackFunction={() => navigation.pop()}
      onlyShowBackButtonOnAndroid
      rightIconOnPress={refreshNextExams}
      rightIcon={refreshing ? (
        <ActivityIndicator size={30} color={DefaultTheme.colors.onSurfaceDisabled}/>
      ) : (
        <RefreshCcwIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled} style={{ margin: 2.5 }}/>
      )}
      goBackButtonStyle={{ opacity: 0.6 }}
      showScrollView={false}
      children={(
        <View style={{ backgroundColor: DefaultTheme.colors.backdrop, width: '100%', height: '100%' }}>
          {errorGettingHomework && (
            <CustomInformationCard
              icon={<AlertTriangleIcon size={25} color={DefaultTheme.colors.error}/>}
              title={"Une erreur s'est produite"}
              description={"Impossible de récupérer les devoirs, vérifiez votre connexion internet."}
              error
              style={{ margin: 20 }}
            />
          )}
          
          {Object.keys(abstractHomeworks).length > 0 ? (
            <FlatList
              style={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
              data={Object.keys(abstractHomeworks)}
              renderItem={({ item, index }) => (
                <View style={{
                  marginBottom: index == Object.keys(abstractHomeworks).length - 1 ? 300 : 0,
                }}>
                  <HomeworkDay
                    key={item}
                    accountID={accountID}
                    day={item}
                    exams={abstractHomeworks[item]}
                  />
                </View>
              )}
              ItemSeparatorComponent={(
                <CustomSeparator style={{
                  backgroundColor: DefaultTheme.colors.surfaceOutline,
                  left: -10,
                  width: Dimensions.get('window').width - 20,
                  marginTop: 50,
                  marginBottom: 50,
                }}/>
              )}
            />
          ) : (
            <Text style={[DefaultTheme.fonts.labelLarge, { textAlign: 'center', marginTop: '50%' }]}>Aucun devoir pour le moment.</Text>
          )}
        </View>
      )}
    />
    */
  );
}

export default HomeworksPage;