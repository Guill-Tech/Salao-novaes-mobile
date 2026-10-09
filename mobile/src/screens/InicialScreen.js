import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Button from '../components/Button';
import { colors, fonts, spacing, radius } from '../theme';

// Dados de exemplo. Na Sprint 2 virão do Firestore (coleção appointments).
const AGENDAMENTOS_EXEMPLO = [
  { id: '1', servico: 'Corte social', data: '12/10', hora: '14:00' },
  { id: '2', servico: 'Barba', data: '15/10', hora: '10:30' },
];

export default function InicialScreen({
  nomeCliente = 'Cliente',
  onEscolherServico = () => {},
}) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/backgroundbarbeiro.png')}
        style={styles.topo}
        resizeMode="cover"
      >
        {/* camada escura por cima da foto, para o texto branco ficar legível */}
        <View style={styles.escurecer} />

        <Text style={styles.saudacao}>{`Olá,\n“${nomeCliente}”!`}</Text>

        <Image
          source={require('../../assets/images/LOGO.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </ImageBackground>

      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Agendamentos :</Text>

        <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
          {AGENDAMENTOS_EXEMPLO.length === 0 ? (
            <Text style={styles.vazio}>Nenhum agendamento ainda</Text>
          ) : (
            AGENDAMENTOS_EXEMPLO.map((item) => (
              <View key={item.id} style={styles.cartao}>
                <Text style={styles.cartaoTitulo}>{item.servico}</Text>
                <Text style={styles.cartaoTexto}>
                  {item.data} às {item.hora}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <Button
          title="Escolher serviço"
          onPress={onEscolherServico}
          style={styles.botao}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topo: {
    height: 250,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  escurecer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  saudacao: {
    color: colors.text,
    fontFamily: fonts.serif,
    fontSize: 38,
    marginTop: spacing.xl,
  },
  logo: {
    position: 'absolute',
    top: 48,
    right: spacing.md,
    width: 100,
    height: 100,
  },
  conteudo: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  titulo: {
    color: colors.textDark,
    fontFamily: fonts.serif,
    fontSize: 22,
    marginBottom: spacing.lg,
  },
  lista: { width: '80%', flex: 1 },
  cartao: {
    backgroundColor: '#D9D9D9',
    borderRadius: radius.sm,
    minHeight: 110,
    justifyContent: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cartaoTitulo: {
    color: colors.textDark,
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartaoTexto: { color: colors.textDark, fontSize: 15, marginTop: spacing.xs },
  vazio: { color: colors.textDark, textAlign: 'center', marginTop: spacing.lg },
  botao: {
    borderColor: '#D9D9D9',
    borderWidth: 5,
    marginTop: spacing.md,
  },
});