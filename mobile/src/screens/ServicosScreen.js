import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import Button from '../components/Button';
import { colors, fonts, spacing, radius } from '../theme';

function formatarPreco(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}
 
// onConfirmar recebe o serviço escolhido. Será ligado à tela de horários.
export default function ServicosScreen({ onConfirmar = () => {} }) {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selecionado, setSelecionado] = useState(null);
 
  // Roda uma vez, quando a tela abre, e busca os serviços no Firestore.
  useEffect(() => {
    async function carregar() {
      try {
        const consulta = query(collection(db, 'services'), orderBy('preco'));
        const resposta = await getDocs(consulta);
        const lista = resposta.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));
        setServicos(lista);
      } catch (e) {
        if (e.code === 'permission-denied') {
          setErro('Faça login para ver os serviços.');
        } else {
          setErro('Não foi possível carregar os serviços. Verifique a conexão.');
        }
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);
 
  function confirmar() {
    if (!selecionado) {
      Alert.alert('Escolha um serviço', 'Toque em um serviço para continuar.');
      return;
    }
    onConfirmar(selecionado);
  }
 
  return (
    <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/backgroundbarbeiro.png')}
          style={styles.topo}
          resizeMode="cover"
        >
          <View style={styles.escurecer} />
        
          <Image
            source={require('../../assets/images/LOGO.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </ImageBackground>
 
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Serviços :</Text>
 
        {carregando ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : erro ? (
          <Text style={styles.mensagem}>{erro}</Text>
        ) : (
          <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
            {servicos.length === 0 ? (
              <Text style={styles.mensagem}>Nenhum serviço disponível.</Text>
            ) : (
              servicos.map((item) => {
                const ativo = selecionado?.id === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelecionado(item)}
                    style={[styles.cartao, ativo && styles.cartaoAtivo]}
                  >
                    <Text style={styles.nome}>{item.nome}</Text>
                    <Text style={styles.preco}>{formatarPreco(item.preco)}</Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        )}
 
        <Button
          title="Confirmar"
          onPress={confirmar}
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
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  cartaoAtivo: { borderColor: colors.primary },
  nome: {
    color: colors.textDark,
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: 'bold',
  },
  preco: { color: colors.textDark, fontSize: 16 },
  mensagem: {
    color: colors.textDark,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  botao: {
    borderColor: '#D9D9D9',
    borderWidth: 5,
    marginTop: spacing.md,
  },
});