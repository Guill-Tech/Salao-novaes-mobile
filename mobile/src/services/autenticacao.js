import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function entrarNoApp(email, senha) {
  try {
    console.log('1. Iniciando autenticação...');

    // 1. Autenticar no Firebase Authentication
    const credencial = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      senha
    );

    const usuario = credencial.user;

    console.log('2. Autenticação concluída!');
    console.log('UID:', usuario.uid);

    // 2. Buscar perfil no Firestore
    const docRef = doc(db, 'users', usuario.uid);

    console.log('3. Buscando perfil no Firestore...');

    const docSnap = await getDoc(docRef);

    console.log('4. Resultado da busca:', docSnap.exists());

    // 3. Verificar se o perfil existe
    if (!docSnap.exists()) {
      throw {
        code: 'auth/perfil-nao-encontrado',
      };
    }

    const dados = docSnap.data();

    console.log('5. Perfil encontrado!');
    console.log('Tipo de usuário:', dados.tipo);

    // 4. Retornar os dados do usuário
    return {
      uid: usuario.uid,
      email: usuario.email,
      tipo: dados.tipo || 'cliente',
      nome: dados.nome || 'Usuário',
    };

  } catch (erro) {
    console.error('Erro na autenticação:', erro);
    console.error('Código:', erro?.code);
    console.error('Mensagem:', erro?.message);

    throw erro;
  }
}

// SAIR DO APLICATIVO
export async function sair() {
  try {
    await signOut(auth);
    console.log('Usuário desconectado.');
  } catch (erro) {
    console.error('Erro ao sair:', erro);
    throw erro;
  }
}

// TRATAMENTO DAS MENSAGENS DE ERRO
export function mensagemDeErroLogin(codigo) {
  switch (codigo) {
    case 'auth/invalid-email':
      return 'O e-mail informado é inválido.';

    case 'auth/user-not-found':
      return 'Não existe conta cadastrada com este e-mail.';

    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';

    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';

    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Tente novamente mais tarde.';

    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet.';

    case 'auth/perfil-nao-encontrado':
      return 'Perfil do usuário não encontrado no banco de dados.';

    case 'permission-denied':
      return 'O Firestore não permitiu acessar os dados do usuário.';

    default:
      return 'Ocorreu um erro. Consulte o terminal para mais detalhes.';
  }
}