import { useRouter } from 'expo-router';
import VisualizarAgendaScreen from '../screens/VisualizarAgendaScreen';

export default function VisualizarAgenda() {
  const router = useRouter();
  return <VisualizarAgendaScreen onVoltar={() => router.back()} />;
}