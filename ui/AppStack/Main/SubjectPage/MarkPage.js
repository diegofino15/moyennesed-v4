import { useEffect, useState } from "react";
import { View, Text, Platform, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";
import { CalendarIcon, ChevronsDownUpIcon, ChevronsUpDownIcon, CornerDownRightIcon, LandPlotIcon, MinusIcon, PlusIcon, TrashIcon, TrendingDownIcon, TrendingUpIcon, Users2Icon, Wand2Icon, WeightIcon, WrenchIcon, XIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";
import ColorsHandler from "../../../../core/ColorsHandler";
import { formatAverage, formatDate, formatDate2, formatDate3, formatMark } from "../../../../util/Utils";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import CustomSection from "../../../components/CustomSection";
import CoefficientHandler from "../../../../core/CoefficientHandler";
import CustomTag from "../../../components/CustomTag";
import AppData from "../../../../core/AppData";


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
                }]}>{mark.valueStr ? mark.valueStr : "--"}</Text>
                <Text style={[DefaultTheme.fonts.headlineMedium, {
                  color: DefaultTheme.colors.onSurfaceDisabled,
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

          {/* Coefficient */}
          <View style={{ top: -20 }}>
            <CustomSimpleInformationCard
              icon={<WeightIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
              content={"Coefficient"}
              style={{ marginBottom: 5 }}
              rightIcon={
                <PressableScale style={{
                  flexDirection: "row",
                  alignItems: "center",
                }} onPress={() => changeCoefficient(10)}>
                  <XIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
                  <Text style={DefaultTheme.fonts.headlineMedium}>{`${mark.coefficient}`.replace(".", ",")}</Text>
                  <ChevronsUpDownIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled} style={{ marginLeft: 5 }}/>
                </PressableScale>
              }
            />
            {(mark.isCustomCoefficient || CoefficientHandler.guessMarkCoefficientEnabled[accountID]) && (
              <CustomTag
                title={mark.isCustomCoefficient ? "Personnalisé" : "Deviné"}
                textStyle={{ color: 'black' }}
                icon={mark.isCustomCoefficient ? <WrenchIcon size={15} color={'black'}/> : <Wand2Icon size={15} color={'black'}/>}
                color={dark}
                onPress={() => {
                  if (CoefficientHandler.guessMarkCoefficientEnabled[accountID] && !mark.isCustomCoefficient) {
                    navigation.navigate('SettingsStack', { openCoefficientsPage: true });
                  }
                }}
                secondaryTag={mark.isCustomCoefficient && (
                  <TrashIcon size={15} color={DefaultTheme.colors.error}/>
                )}
                secondaryTagStyle={{
                  paddingVertical: 3,
                  paddingHorizontal: 3,
                  backgroundColor: DefaultTheme.colors.errorLight,
                  borderWidth: 2,
                  borderColor: DefaultTheme.colors.error,
                }}
                secondaryTagOnPress={resetCustomCoefficient}
                onBottom
              />
            )}
          </View>

          {/* Informations */}
          <CustomSection
            title={"Informations"}
            marginTop={0}
          />
          <CustomSimpleInformationCard
            icon={<CalendarIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
            content={"Date"}
            rightIcon={(
              <Text style={[DefaultTheme.fonts.bodyLarge, {
                color: DefaultTheme.colors.onSurfaceDisabled,
              }]}>{formatDate2(mark.date)}</Text>
            )}
          />

          {/* Competences */}
          {mark.competences.length > 0 && (
            <>
              <CustomSection
                title={"Compétences"}
              />
              {mark.competences.map(competence => (
                <CustomSimpleInformationCard
                  key={competence.id}
                  content={competence.title}
                  subtitle={competence.description}
                  icon={<LandPlotIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>}
                  textStyle={{ width: windowWidth - 90 }}
                  style={{ marginBottom: 10 }}
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
                content={"Moyenne de la sous-matière"}
                icon={mark.subSubjectAverageInfluence > 0 ? (
                  <TrendingUpIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                ) : (
                  <TrendingDownIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                )}
                rightIcon={(
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {mark.subSubjectAverageInfluence > 0 ? (
                      <PlusIcon size={20} color={DefaultTheme.colors.success}/>
                    ) : (
                      <MinusIcon size={20} color={DefaultTheme.colors.error}/>
                    )}
                    <Text style={[DefaultTheme.fonts.headlineMedium, {
                      color: mark.subSubjectAverageInfluence > 0 ? DefaultTheme.colors.success : DefaultTheme.colors.error,
                    }]}>{formatAverage(Math.abs(mark.subSubjectAverageInfluence))}</Text>
                  </View>
                )}
                style={{ marginVertical: 5 }}
              />
            ) : null}
            {mark.subjectAverageInfluence ? (
              <CustomSimpleInformationCard
                content={"Moyenne de la matière"}
                icon={mark.subjectAverageInfluence > 0 ? (
                  <TrendingUpIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                ) : (
                  <TrendingDownIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                )}
                rightIcon={(
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {mark.subjectAverageInfluence > 0 ? (
                      <PlusIcon size={20} color={DefaultTheme.colors.success}/>
                    ) : (
                      <MinusIcon size={20} color={DefaultTheme.colors.error}/>
                    )}
                    <Text style={[DefaultTheme.fonts.headlineMedium, {
                      color: mark.subjectAverageInfluence > 0 ? DefaultTheme.colors.success : DefaultTheme.colors.error,
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
                  <TrendingUpIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                ) : (
                  <TrendingDownIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled}/>
                )}
                rightIcon={(
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {mark.generalAverageInfluence > 0 ? (
                      <PlusIcon size={20} color={DefaultTheme.colors.success}/>
                    ) : (
                      <MinusIcon size={20} color={DefaultTheme.colors.error}/>
                    )}
                    <Text style={[DefaultTheme.fonts.headlineMedium, {
                      color: mark.generalAverageInfluence > 0 ? DefaultTheme.colors.success : DefaultTheme.colors.error,
                    }]}>{formatAverage(Math.abs(mark.generalAverageInfluence))}</Text>
                  </View>
                )}
                style={{ marginVertical: 5 }}
              />
            ) : null}
            </>
          ) : null}
        </View>
      )}
    />
  );
}

export default MarkPage;