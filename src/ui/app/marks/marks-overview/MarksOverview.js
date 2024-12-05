import { useEffect, useRef } from "react";
import { View, Text, FlatList, Dimensions, ScrollView } from "react-native";
import { ChevronsUpDownIcon, Users2Icon, DraftingCompassIcon, TrendingUpIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import useState from "react-usestateref";

import RecentMarkCard from "./RecentMarkCard";
import CustomChooser from "../../../components/CustomChooser";
import CustomEvolutionChart from "../../../components/CustomEvolutionChart";
import CustomAnimatedIndicator from "../../../components/CustomAnimatedIndicator";
import HapticsHandler from "../../../../core/HapticsHandler";
import { formatAverage } from "../../../../util/Utils";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";
import { useCurrentAccountContext } from "../../../../util/CurrentAccountContext";
import MarksStatus from "./MarksStatus";


// Marks overview
function MarksOverview({
  selectedPeriod, setSelectedPeriod,
  latestCurrentPeriod, setLatestCurrentPeriod,
  periods,
  navigation,
}) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater } = useAppStackContext();
  const { accountID } = useCurrentAccountContext();

  // Get periods of student and choose which to display
  useEffect(() => {
    if (Object.keys(periods).length) {
      // Choose period that isn't finished
      let shownPeriod = null;
      let periodValues = Object.values(periods);
      for (let i = 0; i < periodValues.length; i++) {
        if (!periodValues[i].isFinished) {
          shownPeriod = i;
          break;
        }
      }
      if (shownPeriod == null) { shownPeriod = periodValues.length - 1; }
      
      let newSelectedPeriod = Object.keys(periods)[shownPeriod];
      if (latestCurrentPeriod != newSelectedPeriod) {
        setSelectedPeriod(newSelectedPeriod);
        setLatestCurrentPeriod(newSelectedPeriod);
      }
    }
  }, [globalDisplayUpdater, periods]);
  
  // Show average or evolution graph
  const scrollViewRef = useRef(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showClassValueOnChart, setShowClassValueOnChart] = useState(false);
  const [canShowClassValueOnChart, setCanShowClassValueOnChart] = useState(false);
  useEffect(() => {
    if (!periods[selectedPeriod]?.averageHistory?.length) {
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
      return;
    }
    if (!periods[selectedPeriod]?.classAverage) { setCanShowClassValueOnChart(false); }
    else { setCanShowClassValueOnChart(true); }

    if (showEvolution) {
      scrollViewRef.current?.scrollTo({x: Dimensions.get('window').width - 80, animated: true});
    } else {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [showEvolution, selectedPeriod]);

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
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
        <MarksStatus navigation={navigation}/>

        {/* Period chooser */}
        <View style={{
          alignItems: 'flex-end',
        }}>
          <CustomChooser
            title="Sélectionnez une période"
            items={Object.values(periods).map(period => { return {
              title: period.title,
              id: period.id,
            }})}
            defaultItem={<Text style={[theme.fonts.labelMedium, { color: theme.colors.primary }]}>---</Text>}
            getItemForSelected={(periodID) => <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[theme.fonts.labelMedium, {
                color: theme.colors.primary,
                textAlign: 'right',
                width: Dimensions.get("window").width - 245,
              }]}>{periods[periodID]?.title}</Text>
              <ChevronsUpDownIcon size={20} color={theme.colors.primary} style={{ marginLeft: 5 }} />
            </View>}
            selected={selectedPeriod}
            setSelected={setSelectedPeriod}
          />

          {/* Toggle show evolution */}
          {periods[selectedPeriod]?.hasAverage && (
            <View>
              {canShowClassValueOnChart && (
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
                        borderColor: theme.colors.primary,
                        borderRadius: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }} onPress={() => setShowClassValueOnChart(!showClassValueOnChart)}>
                        <Users2Icon size={20} color={theme.colors.primary} style={{ marginRight: 5 }}/>
                        {showClassValueOnChart ? (
                          <EyeIcon size={20} color={theme.colors.primary}/>
                        ) : (
                          <EyeOffIcon size={20} color={theme.colors.primary}/>
                        )}
                      </PressableScale>
                    }
                  />
                </View>
              )}
              <PressableScale style={{
                marginTop: 5,
                backgroundColor: theme.colors.primary,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 5,
              }} onPress={() => {
                setShowEvolution(!showEvolution);
                HapticsHandler.vibrate("light");
              }}>
                {showEvolution ? (
                  <DraftingCompassIcon size={20} color={theme.colors.background} />
                ) : (
                  <TrendingUpIcon size={20} color={theme.colors.background} />
                )}
                <Text style={[theme.fonts.labelMedium, {
                  color: theme.colors.background,
                  marginLeft: 5,
                  height: 22,
                }]}>{showEvolution ? "Moyenne" : "Evolution"}</Text>
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
          marginVertical: 20,
        }}
      >
        <View style={{
          alignItems: 'center',
          width: Dimensions.get('window').width - 80,
        }}>
          <Text style={[theme.fonts.headlineLarge, { fontSize: 40 }]}>{formatAverage(periods[selectedPeriod]?.average)}</Text>
          <Text style={[theme.fonts.labelLarge, { top: -5 }]}>MOYENNE GÉNÉRALE</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
            <Users2Icon size={15} color={theme.colors.onSurfaceDisabled} style={{ marginRight: 5 }}/>
            <Text style={[theme.fonts.labelMedium, { fontFamily: "Numbers-Regular" }]}>: {formatAverage(periods[selectedPeriod]?.classAverage)}</Text>
          </View>
        </View>

        <CustomEvolutionChart
          listOfValues={periods[selectedPeriod]?.averageHistory}
          showClassValues={showClassValueOnChart}
          color={theme.colors.primary}
          lightColor={theme.colors.primary}
          activeColor={theme.colors.primary}
          height={100}
          windowWidth={Dimensions.get('window').width - 80}
        />
      </ScrollView>
     
      {/* Lastest marks */}
      <Text style={[theme.fonts.bodyLarge, { marginBottom: 0 }]}>Dernières notes</Text>
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
              mark={periods[selectedPeriod].marks[item]}
              getSubject={() => periods[selectedPeriod].subjects[periods[selectedPeriod].marks[item].subjectID]}
              navigation={navigation}
            />
          )}}
        />
      ) : (
        <View style={{
          borderWidth: 2,
          borderColor: theme.colors.surfaceOutline,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          height: 90,
          marginBottom: 10,
        }}>
          <Text style={theme.fonts.labelLarge}>Aucune note</Text>
        </View>
      )}
    </View>
  );
}

export default MarksOverview;