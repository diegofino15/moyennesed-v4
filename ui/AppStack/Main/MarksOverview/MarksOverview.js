import { useEffect, useRef } from "react";
import { View, Text, FlatList, Dimensions, ScrollView } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { HelpCircleIcon, ChevronsUpDownIcon, Users2Icon, DraftingCompassIcon, TrendingUpIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useState from "react-usestateref";

import RecentMarkCard from "./RecentMarkCard";
import CustomChooser from "../../../components/CustomChooser";
import CustomEvolutionChart from "../../../components/CustomEvolutionChart";
import CustomAnimatedIndicator from "../../../components/CustomAnimatedIndicator";
import CustomAnimatedChangeableItem from "../../../components/CustomAnimatedChangeableItem";
import { formatAverage } from "../../../../util/Utils";
import HapticsHandler from "../../../../core/HapticsHandler";


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
  const [oldAccountID, setOldAccountID] = useState(accountID);

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
        if (firstDisplayMarksRef.current.length == 0 || accountID != oldAccountID) {
          setFirstDisplayMarks(Object.keys(Object.values(periodsRef.current)[shownPeriod].marks));
          setOldAccountID(accountID);
        }
      } else { setPeriods({}); }
    });
  }, [accountID, globalDisplayUpdater]);

  // Show average or evolution graph
  const scrollViewRef = useRef(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showClassValueOnChart, setShowClassValueOnChart] = useState(false);
  useEffect(() => {
    if (showEvolution) {
      scrollViewRef.current?.scrollTo({x: Dimensions.get('window').width - 80, animated: true});
    } else {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [showEvolution]);

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
      }}>
        {/* Loading status */}
        <CustomAnimatedChangeableItem
          item={(
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
          )}
          animationTime={200}
          updaters={[
            isLoading,
            gotMarks,
            errorGettingMarks,
          ]}
        />

        {/* Period chooser */}
        <View style={{
          alignItems: 'flex-end',
          position: 'absolute',
          right: 0,
        }}>
          <CustomChooser
            title="Sélectionnez une période"
            items={Object.values(periods).map(period => { return {
              title: period.title,
              id: period.id,
            }})}
            defaultItem={<Text style={[DefaultTheme.fonts.labelMedium, { color: DefaultTheme.colors.primary }]}>---</Text>}
            getItemForSelected={(periodID) => <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[DefaultTheme.fonts.labelMedium, {
                color: DefaultTheme.colors.primary,
                width: Dimensions.get('window').width - 190,
                textAlign: 'right',
              }]}>{periods[periodID]?.title}</Text>
              <ChevronsUpDownIcon size={16} color={DefaultTheme.colors.primary} style={{ marginLeft: 5 }} />
            </View>}
            selected={selectedPeriod}
            setSelected={setSelectedPeriod}
          />

          {/* Toggle show evolution */}
          {periods[selectedPeriod]?.hasAverage && (
            <View>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                position: 'absolute',
                marginTop: 5,
              }}>
                <CustomAnimatedIndicator
                  value={showEvolution}
                  startScale={0}
                  endX={-60}
                  child={
                    <PressableScale style={{
                      padding: 3,
                      borderWidth: 2,
                      borderColor: DefaultTheme.colors.primary,
                      borderRadius: 5,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }} onPress={() => setShowClassValueOnChart(!showClassValueOnChart)}>
                      <Users2Icon size={20} color={DefaultTheme.colors.primary} style={{ marginRight: 5 }}/>
                      {showClassValueOnChart ? (
                        <EyeIcon size={20} color={DefaultTheme.colors.primary}/>
                      ) : (
                        <EyeOffIcon size={20} color={DefaultTheme.colors.primary}/>
                      )}
                    </PressableScale>
                  }
                />
              </View>
              <PressableScale style={{
                backgroundColor: DefaultTheme.colors.primary,
                borderRadius: 5,
                marginTop: 5,
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
              }} onPress={() => {
                setShowEvolution(!showEvolution);
                HapticsHandler.vibrate('light');
              }}>
                {showEvolution ? (
                  <DraftingCompassIcon size={20} color={'black'}/>
                ) : (
                  <TrendingUpIcon size={20} color={'black'}/>
                )}
              </PressableScale>
            </View>
          )}
        </View>
      </View>
      
      {/* Main average & evolution */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{
          marginTop: 30,
          marginBottom: 20,
        }}
      >
        <View style={{
          alignItems: 'center',
          width: Dimensions.get('window').width - 80,
        }}>
          <Text style={[DefaultTheme.fonts.headlineLarge, { fontSize: 40 }]}>{formatAverage(periods[selectedPeriod]?.average)}</Text>
          <Text style={[DefaultTheme.fonts.labelLarge, { top: -5 }]}>MOYENNE GÉNÉRALE</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
            <Users2Icon size={15} color={DefaultTheme.colors.onSurfaceDisabled} style={{ marginRight: 5 }}/>
            <Text style={[DefaultTheme.fonts.labelMedium, { fontFamily: "Numbers-Regular" }]}>: {formatAverage(periods[selectedPeriod]?.classAverage)}</Text>
          </View>
        </View>

        <CustomEvolutionChart
          listOfValues={periods[selectedPeriod]?.averageHistory}
          showClassValues={showClassValueOnChart}
          color={DefaultTheme.colors.primary}
          lightColor={DefaultTheme.colors.primary}
          activeColor={DefaultTheme.colors.primary}
          height={100}
          windowWidth={Dimensions.get('window').width - 80}
        />
      </ScrollView>

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