import { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { HelpCircleIcon, ChevronsUpDownIcon, Users2Icon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import CustomChooser from "../../../components/CustomChooser";
import { formatAverage } from "../../../../util/Utils";
import RecentMarkCard from "./RecentMarkCard";


// Marks overview
function MarksOverview({
  accountID,
  selectedPeriod, setSelectedPeriod,
  latestCurrentPeriod, setLatestCurrentPeriod,

  isLoading,
  gotMarks,
  errorGettingMarks,
  
  globalDisplayUpdater,
  navigation,
}) {
  // List of marks present at first display, used to show new marks
  const [firstDisplayMarks, setFirstDisplayMarks, firstDisplayMarksRef] = useState([]);

  // Get periods of student and choose which to display
  const [periods, setPeriods, periodsRef] = useState({});
  useEffect(() => {
    console.log("Updated display !")
    AsyncStorage.getItem("marks").then(async (data) => {
      var cacheData = {};
      if (data) { cacheData = JSON.parse(data); }
      if (accountID in cacheData) {
        setPeriods(cacheData[accountID].data);

        // Choose period that isn't finished
        let shownPeriod = 0;
        Object.values(periodsRef.current).forEach(period => { if (period.isFinished) { shownPeriod += 1; } })
        if (shownPeriod == Object.keys(periodsRef.current).length) { shownPeriod -= 1; }
        let newSelectedPeriod = Object.keys(periodsRef.current)[shownPeriod];
        if (latestCurrentPeriod != newSelectedPeriod) {
          setSelectedPeriod(newSelectedPeriod);
          setLatestCurrentPeriod(newSelectedPeriod);
        }

        // Save first display marks
        if (firstDisplayMarksRef.current.length == 0) {
          setFirstDisplayMarks(Object.keys(Object.values(periodsRef.current)[shownPeriod].marks));
        }
      } else { setPeriods({}); }
    });
  }, [accountID, globalDisplayUpdater]);

  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderRadius: 20,
      padding: 20,
      paddingBottom: 10,
      marginHorizontal: 20,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Loading status */}
        <PressableScale style={{
          backgroundColor: isLoading ? DefaultTheme.colors.primaryLight : gotMarks ? DefaultTheme.colors.successLight : DefaultTheme.colors.errorLight,
          borderWidth: 2,
          borderColor: isLoading ? DefaultTheme.colors.primary : gotMarks ? DefaultTheme.colors.success : DefaultTheme.colors.error,
          borderRadius: 5,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 2,
          paddingHorizontal: 5
        }} onPress={() => { if (!isLoading) { navigation.navigate("MarksInformationPage", { accountID }); } }}>
          <Text style={[
            DefaultTheme.fonts.labelMedium, {
              color: isLoading ? DefaultTheme.colors.primary : gotMarks ? DefaultTheme.colors.success : DefaultTheme.colors.error,
              marginRight: 5,
              height: 22,
          }]}>{isLoading ? "Chargement..." : gotMarks ? "À jour" : errorGettingMarks ? "Erreur" : "Pas à jour"}</Text>
          {(!isLoading) && <HelpCircleIcon size={20} color={gotMarks ? DefaultTheme.colors.success : DefaultTheme.colors.error}/>}
        </PressableScale>

        {/* Period chooser */}
        <CustomChooser
          title="Sélectionnez une période"
          items={Object.values(periods).map(period => { return {
            title: period.title,
            id: period.id,
          }})}
          defaultItem={<Text style={[DefaultTheme.fonts.labelMedium, { color: DefaultTheme.colors.primary }]}>---</Text>}
          getItemForSelected={(periodID) => <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[DefaultTheme.fonts.labelMedium, { color: DefaultTheme.colors.primary }]}>{periods[periodID]?.title}</Text>
            <ChevronsUpDownIcon size={16} color={DefaultTheme.colors.primary} style={{ marginLeft: 5 }} />
          </View>}
          selected={selectedPeriod}
          setSelected={setSelectedPeriod}
        />
      </View>
      
      {/* Main average */}
      <View style={{
        alignItems: 'center',
        marginVertical: 30,
      }}>
        <Text style={[DefaultTheme.fonts.headlineLarge, { fontSize: 40 }]}>{formatAverage(periods[selectedPeriod]?.average)}</Text>
        <Text style={[DefaultTheme.fonts.labelLarge, { top: -5 }]}>MOYENNE GÉNÉRALE</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
          <Users2Icon size={15} color={DefaultTheme.colors.onSurfaceDisabled} style={{ marginRight: 5 }}/>
          <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: "Numbers-Regular" }]}>: {formatAverage(periods[selectedPeriod]?.classAverage)}</Text>
        </View>
      </View>

      {/* Lastest marks */}
      <Text style={[DefaultTheme.fonts.bodyLarge, { marginBottom: 0 }]}>Dernières notes</Text>
      {Object.keys(periods[selectedPeriod]?.marks || {}).length > 0 ? (
        <FlatList
          horizontal
          key={`${accountID}${selectedPeriod}`}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={<View style={{ width: 10 }}/>}
          data={periods[selectedPeriod]?.sortedMarks.slice(0, 15)}
          renderItem={({ item }) => {
            return (
            <RecentMarkCard
              accountID={accountID}
              mark={periods[selectedPeriod].marks[item]}
              getSubject={() => periods[selectedPeriod].subjects[periods[selectedPeriod].marks[item].subjectID]}
              showNewLabel={selectedPeriod == latestCurrentPeriod && !firstDisplayMarks.includes(`${item}`)}
              navigation={navigation}
            />
          )}}
          style={{ paddingBottom: 10 }}
        />
      ) : (
        <View style={{
          borderWidth: 2,
          borderColor: DefaultTheme.colors.surfaceOutline,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          height: 90,
          marginBottom: 10,
        }}>
          <Text style={DefaultTheme.fonts.labelLarge}>Aucune note</Text>
        </View>
      )}
    </View>
  );
}

export default MarksOverview;