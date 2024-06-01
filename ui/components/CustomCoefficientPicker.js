import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { DefaultTheme } from "react-native-paper";
import { PencilRulerIcon, TrashIcon, Wand2Icon, WeightIcon, WrenchIcon, XIcon } from "lucide-react-native";

import CustomTag from "./CustomTag";
import CustomSimpleInformationCard from "./CustomSimpleInformationCard";


// Custom coefficient picker
function CustomCoefficientPicker({ coefficient, setCoefficient, resetCoefficient, isCustom, isGuessed, openGuessParametersPage, dark, style }) {
  const [tempCoefficient, setTempCoefficient] = useState(coefficient.toString().replace(".", ","));
  useEffect(() => { setTempCoefficient(coefficient.toString().replace(".", ",")) }, [coefficient]);

  function allowOnlyNumbers(input) {
    // Remove all non-numeric characters except for the decimal point or comma
    return input.replace(/[^0-9.,]/g, '');
  }

  return (
    <View style={style}>
      <CustomSimpleInformationCard
        icon={<WeightIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>}
        content={"Coefficient"}
        style={{ marginBottom: 5 }}
        rightIcon={(
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <XIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
            <View>
              <TextInput
                style={{
                  ...DefaultTheme.fonts.headlineMedium,
                  color: DefaultTheme.colors.onSurface,
                  width: "auto",
                  minWidth: 70,
                  textAlign: 'right',
                  paddingRight: 30,
                  paddingLeft: 10,
                  borderWidth: 1,
                  borderColor: DefaultTheme.colors.onSurfaceDisabled,
                  borderRadius: 5,
                  borderStyle: 'dashed',
                }}
                placeholder={"--"}
                value={tempCoefficient}
                onChangeText={(newCoefficient) => setTempCoefficient(allowOnlyNumbers(newCoefficient))}
                onSubmitEditing={() => {
                  let newCoefficient = parseFloat(tempCoefficient.replace(",", "."));
                  if (!isNaN(newCoefficient)) { setCoefficient(newCoefficient); }
                  else { setTempCoefficient(coefficient); }
                }}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            <PencilRulerIcon size={20} color={DefaultTheme.colors.onSurfaceDisabled} style={{
              position: 'absolute',
              right: 5,
            }}/>
          </View>
        )}
      />
      {(isCustom || isGuessed) && (
        <CustomTag
          title={isCustom ? "Personnalisé" : "Deviné"}
          textStyle={{ color: 'black' }}
          icon={isCustom ? <WrenchIcon size={15} color={'black'}/> : <Wand2Icon size={15} color={'black'}/>}
          color={dark}
          onPress={openGuessParametersPage}
          secondaryTag={isCustom && (
            <TrashIcon size={15} color={DefaultTheme.colors.error}/>
          )}
          secondaryTagStyle={{
            paddingVertical: 3,
            paddingHorizontal: 3,
            backgroundColor: DefaultTheme.colors.errorLight,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.error,
          }}
          secondaryTagOnPress={resetCoefficient}
          onBottom
          offset={12}
        />
      )}
    </View>
  );
}

export default CustomCoefficientPicker;