import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { PencilRulerIcon, TrashIcon, Wand2Icon, WeightIcon, WrenchIcon, XIcon } from "lucide-react-native";

import CustomTag from "./CustomTag";
import CustomSimpleInformationCard from "./CustomSimpleInformationCard";
import { useGlobalAppContext } from "../../src/util/GlobalAppContext";


// Custom coefficient picker
function CustomCoefficientPicker({ coefficient, setCoefficient, resetCoefficient, isCustom, isGuessed, openGuessParametersPage, dark, style }) {
  const { theme } = useGlobalAppContext();
  
  const [tempCoefficient, setTempCoefficient] = useState(coefficient.toString().replace(".", ","));
  useEffect(() => { setTempCoefficient(coefficient.toString().replace(".", ",")) }, [coefficient]);

  function allowOnlyNumbers(input) {
    // Remove all non-numeric characters except for the decimal point or comma
    return input.replace(/[^0-9.,]/g, '');
  }

  return (
    <View style={style}>
      <CustomSimpleInformationCard
        icon={<WeightIcon size={25} color={theme.colors.onSurfaceDisabled}/>}
        content={"Coefficient"}
        style={{ marginBottom: 5 }}
        rightIcon={(
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <XIcon size={15} color={theme.colors.onSurfaceDisabled}/>
            <View>
              <TextInput
                style={{
                  ...theme.fonts.headlineMedium,
                  color: theme.colors.onSurface,
                  width: "auto",
                  minWidth: 70,
                  textAlign: 'right',
                  paddingRight: 30,
                  paddingLeft: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.onSurfaceDisabled,
                  borderRadius: 5,
                  borderStyle: 'dashed',
                }}
                placeholder={"--"}
                value={tempCoefficient}
                onChangeText={(newCoefficient) => setTempCoefficient(allowOnlyNumbers(newCoefficient))}
                onSubmitEditing={() => {
                  let newCoefficient = parseFloat(tempCoefficient.replace(",", "."));
                  if (!isNaN(newCoefficient) && newCoefficient != 0) { setCoefficient(newCoefficient); }
                  else { setTempCoefficient(coefficient.toString().replace(".", ",")); }
                }}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
            <PencilRulerIcon size={20} color={theme.colors.onSurfaceDisabled} style={{
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
            <TrashIcon size={15} color={theme.colors.error}/>
          )}
          secondaryTagStyle={{
            paddingVertical: 3,
            paddingHorizontal: 3,
            backgroundColor: theme.colors.errorLight,
            borderWidth: 2,
            borderColor: theme.colors.error,
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