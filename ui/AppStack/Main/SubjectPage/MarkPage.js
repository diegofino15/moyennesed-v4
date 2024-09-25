import { useEffect, useState } from "react";
import { View, Text, Platform, Dimensions, Switch } from "react-native";
import { PressableScale } from "react-native-pressable-scale";
import { CalendarIcon, EllipsisIcon, LandPlotIcon, MegaphoneIcon, MegaphoneOffIcon, MessageSquareIcon, MinusIcon, PenToolIcon, PlusIcon, TrendingDownIcon, TrendingUpIcon, Users2Icon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import CustomSection from "../../../components/CustomSection";
import CustomChooser from "../../../components/CustomChooser";
import CustomCoefficientPicker from "../../../components/CustomCoefficientPicker";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import { asyncExpectedResult, formatAverage, formatDate2, formatMark } from "../../../../util/Utils";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { useAppStackContext } from "../../../../util/AppStackContext";
import CoefficientHandler from "../../../../core/CoefficientHandler";
import ColorsHandler from "../../../../core/ColorsHandler";
import AppData from "../../../../core/AppData";


// Mark page
function MarkPage({ navigation, route }) {
  const { theme } = useGlobalAppContext();
  const { globalDisplayUpdater, updateGlobalDisplay } = useAppStackContext();
  
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

  // Change mark coefficient
  async function changeCoefficient(newCoefficient) {
    await AppData.setCustomData(
      accountID,
      "marks",
      `${mark.id}`,
      "coefficient",
      newCoefficient,
      mark.periodID,
    );
    await AppData.recalculateAverageHistory(accountID);
    updateGlobalDisplay();
  }
  async function resetCustomCoefficient() {
    await AppData.removeCustomData(
      accountID,
      "marks",
      `${mark.id}`,
      "coefficient",
      mark.periodID,
    );
    await AppData.recalculateAverageHistory(accountID);
    updateGlobalDisplay();
  }

  // Change if mark is effective
  const [isEffective, setIsEffective] = useState(mark.isEffective ?? true);
  function toggleIsEffective() {
    asyncExpectedResult(
      async () => {
        await AppData.setCustomData(
          accountID,
          "marks",
          mark.id,
          "isEffective",
          !mark.isEffective,
          mark.periodID,
        );
        await AppData.recalculateAverageHistory(accountID);
      },
      () => updateGlobalDisplay(),
      () => setIsEffective(!mark.isEffective),
    );
  }

  // Custom settings
  const [countMarksWithOnlyCompetences, setCountMarksWithOnlyCompetences] = useState(false);
  useEffect(() => {
    AppData.getPreference("countMarksWithOnlyCompetences").then(setCountMarksWithOnlyCompetences);
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
      rightIconStyle={{ backgroundColor: undefined, borderWidth: 0, padding: 7 }}
      rightIcon={(
        <CustomChooser
          title={"Plus d'infos"}
          defaultItem={<EllipsisIcon size={25} color={'black'}/>}
          items={[
            { title: "Code note", subtitle: `${mark.id}` },
            { title: mark.isEffective ? "Désactiver cette note" : "Activer cette note", onPress: toggleIsEffective, destructive: mark.isEffective },
          ]}
        />
      )}
      children={(
        <View style={{ backgroundColor: theme.colors.backdrop }}>
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
                <Text style={[theme.fonts.headlineLarge, {
                  fontSize: 45,
                }]}>{mark.valueStr ? mark.valueStr : "--"}</Text>
                <Text style={[theme.fonts.headlineMedium, {
                  color: theme.colors.onSurfaceDisabled,
                  bottom: -15,
                }]}>{mark.valueOn ? `/${mark.valueOn}`.replace(".", ",") : "/--"}</Text>
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
                  <Text style={[theme.fonts.headlineMedium, {
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
            backgroundColor: theme.colors.backdrop,
            padding: 20,
            paddingTop: 0,
            borderWidth: 2,
            borderColor: theme.colors.surfaceOutline,
            borderRadius: 20,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomWidth: 0,
            width: windowWidth + 4,
            left: -22,
          }}>
            <Text style={[theme.fonts.bodyLarge, {
              color: 'black',
              backgroundColor: dark,
              paddingHorizontal: 20,
              paddingVertical: 5,
              borderRadius: 5,
              overflow: 'hidden',
              textAlign: 'center',
              top: -10,
            }]}>{mark.title}</Text>
          
            {/* Coefficient */}
            <CustomCoefficientPicker
              coefficient={mark.coefficient}
              setCoefficient={changeCoefficient}
              resetCoefficient={resetCustomCoefficient}
              isCustom={mark.isCustomCoefficient}
              isGuessed={CoefficientHandler.guessMarkCoefficientEnabled[accountID]}
              openGuessParametersPage={() => {
                if (CoefficientHandler.guessMarkCoefficientEnabled[accountID] && !mark.isCustomCoefficient) {
                  navigation.navigate('SettingsStack', { openCoefficientsPage: true });
                }
              }}
              dark={dark}
            />
            
            {/* Informations */}
            <CustomSection title={"Informations"}/>
            <CustomSimpleInformationCard
              icon={<CalendarIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
              content={"Date"}
              rightIcon={(
                <Text style={[theme.fonts.bodyLarge, {
                  width: windowWidth - 150,
                  textAlign: "right",
                }]}>{formatDate2(mark.date)}</Text>
              )}
            />
            {mark.type && (
              <CustomSimpleInformationCard
                icon={<PenToolIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                content={"Type"}
                rightIcon={(
                  <Text style={[theme.fonts.bodyLarge, {
                    width: windowWidth - 150,
                    textAlign: "right",
                  }]}>{mark.type}</Text>
                )}
                style={{ marginTop: 10 }}
              />
            )}
            {mark.comment && (
              <CustomSimpleInformationCard
                icon={<MessageSquareIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                content={"Commentaire"}
                subtitle={mark.comment}
                style={{ marginTop: 10 }}
              />
            )}

            {/* Competences */}
            {mark.competences.length > 0 && (
              <>
                <CustomSection title={"Compétences"}/>
                {mark.competences.map(competence => (
                  <CustomSimpleInformationCard
                    key={competence.id}
                    content={competence.title}
                    subtitle={competence.description}
                    icon={<LandPlotIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
                    textStyle={{ width: windowWidth - 90, ...theme.fonts.bodyLarge }}
                    style={{ marginBottom: 25, overflow: "visible" }}
                    additionalObject={(
                      <PressableScale style={{
                        flexDirection: "row",
                        alignItems: "center",
                        position: 'absolute',
                        right: 10,
                        bottom: -20,
                        backgroundColor: theme.colors.surface,
                        borderWidth: 2,
                        borderColor: theme.colors.surfaceOutline,
                        borderRadius: 10,
                        paddingHorizontal: 5,
                        paddingVertical: 3,
                        shadowOpacity: 0.5,
                        shadowOffset: { width: 0, height: 0 },
                      }}>
                        <View style={{
                          width: 30,
                          height: 20,
                          backgroundColor: competence.value <= 0 ? theme.colors.onSurfaceDisabled : competence.value == 1 ? theme.colors.error : competence.value == 2 ? "#FFC300" : competence.value == 3 ? theme.colors.primary : theme.colors.success, // To adapt
                          borderRadius: 5,
                          marginRight: 5,
                        }}/>
                        <Text style={theme.fonts.bodyMedium}>{
                          competence.value <= 0 ? "N/A" : competence.value == 1 ? "Maîtrise insuffisante" : competence.value == 2 ? "Maîtrise fragile" : competence.value == 3 ? "Maîtrise satisfaisante" : "Très bonne maîtrise"
                        }</Text>
                      </PressableScale>
                    )}
                  />
                ))}
              </>
            )}

            {/* Influence on averages */}
            {mark.generalAverageInfluence || mark.subjectAverageInfluence || mark.subSubjectAverageInfluence ? (
              <>
              <CustomSection
                title={"Influence"}
                viewStyle={{ marginBottom: 5 }}
              />
              {mark.subSubjectAverageInfluence ? (
                <CustomSimpleInformationCard
                  content={"Sous-matière"}
                  icon={mark.subSubjectAverageInfluence > 0 ? (
                    <TrendingUpIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                  ) : (
                    <TrendingDownIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                  )}
                  rightIcon={(
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {mark.subSubjectAverageInfluence > 0 ? (
                        <PlusIcon size={20} color={theme.colors.success}/>
                      ) : (
                        <MinusIcon size={20} color={theme.colors.error}/>
                      )}
                      <Text style={[theme.fonts.headlineMedium, {
                        color: mark.subSubjectAverageInfluence > 0 ? theme.colors.success : theme.colors.error,
                      }]}>{formatAverage(Math.abs(mark.subSubjectAverageInfluence))}</Text>
                    </View>
                  )}
                  style={{ marginVertical: 5 }}
                />
              ) : null}
              {mark.subjectAverageInfluence ? (
                <CustomSimpleInformationCard
                  content={"Matière"}
                  icon={mark.subjectAverageInfluence > 0 ? (
                    <TrendingUpIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                  ) : (
                    <TrendingDownIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                  )}
                  rightIcon={(
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {mark.subjectAverageInfluence > 0 ? (
                        <PlusIcon size={20} color={theme.colors.success}/>
                      ) : (
                        <MinusIcon size={20} color={theme.colors.error}/>
                      )}
                      <Text style={[theme.fonts.headlineMedium, {
                        color: mark.subjectAverageInfluence > 0 ? theme.colors.success : theme.colors.error,
                      }]}>{formatAverage(Math.abs(mark.subjectAverageInfluence))}</Text>
                    </View>
                  )}
                  style={{ marginVertical: 5 }}
                />
              ) : null}
              {mark.generalAverageInfluence ? (
                <CustomSimpleInformationCard
                  content={"Moyenne générale"}
                  icon={mark.generalAverageInfluence > 0 ? (
                    <TrendingUpIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                  ) : (
                    <TrendingDownIcon size={20} color={theme.colors.onSurfaceDisabled}/>
                  )}
                  rightIcon={(
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {mark.generalAverageInfluence > 0 ? (
                        <PlusIcon size={20} color={theme.colors.success}/>
                      ) : (
                        <MinusIcon size={20} color={theme.colors.error}/>
                      )}
                      <Text style={[theme.fonts.headlineMedium, {
                        color: mark.generalAverageInfluence > 0 ? theme.colors.success : theme.colors.error,
                      }]}>{formatAverage(Math.abs(mark.generalAverageInfluence))}</Text>
                    </View>
                  )}
                  style={{ marginVertical: 5 }}
                />
              ) : null}
              </>
            ) : null}

            {/* Disable mark */}
            <CustomSection title={"Autre"}/>
            {mark.onlyHasCompetences && (
              <>
                <Text style={[theme.fonts.labelLarge, { textAlign: "justify" }]}>Cette note n'a pas de valeur numérique, vous pouvez choisir de la compter comme une note sur 3 en fonction de la notation des compétences.</Text>
                <CustomSimpleInformationCard
                  icon={<LandPlotIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
                  content={"Compter les compétences"}
                  textStyle={theme.fonts.bodyLarge}
                  subtitle={"Paramètre global"}
                  rightIcon={(
                    <Switch
                      value={countMarksWithOnlyCompetences}
                      onValueChange={async (value) => {
                        await AppData.setPreference("countMarksWithOnlyCompetences", value);
                        await AppData.recalculateAverageHistory(accountID);
                        updateGlobalDisplay();
                      }}
                      disabled={!mark.hasValue}
                    />
                  )}
                  style={{ marginVertical: 10 }}
                />
              </>
            )}
            <CustomSimpleInformationCard
              icon={isEffective ? (
                <MegaphoneIcon size={25} color={theme.colors.error}/>
              ) : (
                <MegaphoneOffIcon size={25} color={theme.colors.error}/>
              )}
              content={"Désactiver la note"}
              textStyle={{ color: theme.colors.error }}
              subtitle={!mark.defaultIsEffective && "Note désactivée par défaut"}
              rightIcon={(
                <Switch
                  value={!isEffective}
                  onValueChange={toggleIsEffective}
                  disabled={!mark.hasValue}
                />
              )}
            />
          </View>
        </View>
      )}
    />
  );
}

export default MarkPage;