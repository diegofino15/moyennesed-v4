import { memo, useEffect } from "react";
import useState from "react-usestateref";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import { ChevronsUpDownIcon, SearchCodeIcon } from "lucide-react-native";
import LottieView from "lottie-react-native";
import { addDoc, collection, getFirestore } from '@react-native-firebase/firestore';

import CustomModal from "../../../components/CustomModal";
import CustomSection from "../../../components/CustomSection";
import CustomButton from "../../../components/CustomButton";
import CustomChooser from "../../../components/CustomChooser";
import CustomBigTextInput from "../../../components/CustomBigTextInput";
import CustomSimpleInformationCard from "../../../components/CustomSimpleInformationCard";
import { useGlobalAppContext } from "../../../../util/GlobalAppContext";
import { anonymiseForBugReport, anonymiseAccountKeyedLogs } from "../../../../util/anonymise";
import StorageHandler from "../../../../core/StorageHandler";


// Ad information page
function BugReportPage({ navigation }) {
  const { theme } = useGlobalAppContext();

  // Types of bugs
  const bugTypes = {
    "functionality": { title: 'Fonctionnement', id: 'functionality' },
    "interface": { title: 'Interface', id: 'interface' },
    "performance": { title: 'Performance', id: 'performance' },
    "other": { title: 'Autre', id: 'other' },
  };
  const [selectedBugType, setSelectedBugType] = useState("functionality");
  const [bugDescription, setBugDescription] = useState("");

  // Send bug report
  const [sentBugReport, setSentBugReport] = useState(false);
  useEffect(() => {
    StorageHandler.getData("lastTimeSentBugReport").then((value) => {
      if (value) {
        const lastTimeSentBugReport = new Date(value);
        const now = new Date();
        const diffTime = Math.abs(now - lastTimeSentBugReport);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
          setSentBugReport(true);
        }
      }
    })
  }, []);

  const [isSendingBugReport, setIsSendingBugReport] = useState(false);
  const [errorWhileSendingBugReport, setErrorWhileSendingBugReport] = useState(false);
  async function sendBugReport() {
    if (isSendingBugReport || sentBugReport) { return; }

    setErrorWhileSendingBugReport(false);
    setIsSendingBugReport(true);

    // Get logs, without secrets nor personal data
    const loginLogs = anonymiseLogin(await StorageHandler.getData("logs-login"));
    const marksLogs = anonymiseAccountKeyedLogs(await StorageHandler.getData("logs-marks"));
    const homeworkLogs = anonymiseAccountKeyedLogs(await StorageHandler.getData("logs-homework"));

    try {
      // Random document ID : the report must not be linked to the ÉcoleDirecte username
      const firestore = getFirestore();
      const bugReportsCollection = collection(firestore, "bugReports");
      await addDoc(bugReportsCollection, {
        date: new Date(),
        type: selectedBugType,
        description: bugDescription,
        logs: {
          login: loginLogs,
          marks: marksLogs,
          homework: homeworkLogs,
        },
      });
      console.log("Sent bug report !");
      StorageHandler.saveData("lastTimeSentBugReport", new Date());
      setSentBugReport(true);
    } catch (e) {
      setErrorWhileSendingBugReport(true);
      console.warn("Error while sending bug report");
      console.warn(e);
    }

    setIsSendingBugReport(false);
  }

  // Login logs : keep placeholder names so the replayed account still displays
  function anonymiseLogin(loginLogs) {
    const anonymised = anonymiseForBugReport(loginLogs);
    anonymised?.data?.accounts?.forEach(account => {
      account.prenom = "Jack";
      account.nom = "Sparrow";
      account.profile?.eleves?.forEach((eleve, index) => {
        eleve.prenom = `Enfant ${index}`;
        eleve.nom = "Sparrow";
      });
    });
    return anonymised;
  }

  // Window width (for ipads)
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  return (
    <CustomModal
      goBackFunction={() => navigation.pop()}
      style={{ paddingVertical: 0 }}
      horizontalPadding={0}
      setWidth={setWindowWidth}
      children={(
        <View>
          {/* Animation and title */}
          <View style={{
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <LottieView
              autoPlay
              loop
              source={require('../../../../../assets/lottie/bug-report.json')}
              style={{
                width: '70%',
                height: windowWidth * 0.7,
              }}
            />
            <Text style={[theme.fonts.titleMedium, { width: '90%', textAlign: 'center' }]}>Signaler un bug</Text>
          </View>
          
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <CustomSimpleInformationCard
              content={"Type"}
              icon={<SearchCodeIcon size={20} color={theme.colors.onSurfaceDisabled}/>}
              rightIcon={(
                <CustomChooser
                  title={"Choisir un type de bug"}
                  selected={selectedBugType}
                  setSelected={setSelectedBugType}
                  items={Object.values(bugTypes)}
                  defaultItem={(
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[theme.fonts.bodyLarge, { marginRight: 5 }]}>{bugTypes[selectedBugType].title}</Text>
                      <ChevronsUpDownIcon size={20} color={theme.colors.onSurface}/>
                    </View>
                  )}
                />
              )}
            />
            <CustomBigTextInput
              title={"Plus en détail"}
              placeholder={"..."}
              value={bugDescription}
              setValue={setBugDescription}
              height={150}
              maxLength={250}
              style={{ marginTop: 10 }}
              windowWidth={windowWidth}
            />
            <Text style={[theme.fonts.labelMedium, { color: theme.colors.onSurfaceDisabled, marginTop: 5 }]}>{`${bugDescription.length}/250`}</Text>
          
            {/* Send button */}
            <CustomButton
              title={sentBugReport ? (
                <Text style={[theme.fonts.bodyLarge, {
                  height: 25,
                  color: theme.colors.onPrimary,
                }]}>Merci de votre aide !</Text>
              ) : errorWhileSendingBugReport ? (
                <Text style={[theme.fonts.bodyLarge, {
                  height: 25,
                  color: theme.colors.onPrimary,
                }]}>Une erreur est survenue</Text>
              ) : isSendingBugReport ? (
                <ActivityIndicator size={25} color={theme.colors.onPrimary}/>
              ) : (
                <Text style={[theme.fonts.bodyLarge, {
                  height: 25,
                  color: theme.colors.onPrimary,
                }]}>Envoyer</Text>
              )}
              onPress={sendBugReport}
              style={{
                marginTop: 20,
                backgroundColor: sentBugReport ? theme.colors.success : errorWhileSendingBugReport ? theme.colors.error : theme.colors.primary,
              }}
            />

            {/* Informations */}
            <CustomSection
              title={"Plus d'infos"}
            />
            <Text style={[theme.fonts.labelLarge, { textAlign: "justify", marginBottom: 10 }]}>En envoyant un signalement de bug, vous acceptez de partager l'ensemble des informations recueillies par l'app sur votre compte, y compris vos notes, moyennes, etc.</Text>
            <Text style={[theme.fonts.labelLarge, { textAlign: "justify" }]}>Votre identifiant, votre mot de passe et vos jetons de connexion ne sont jamais envoyés. Les noms, coordonnées, photos, l'établissement et les appréciations sont retirés avant l'envoi.</Text>
          </View>
        </View>
      )}
    />
  );
}

export default memo(BugReportPage);