import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function entrarNoApp(email, senha) {
  try {
    const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
    const usuario = credencial.user;

    const docRef = doc(db, 'usuarios', usuario.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw { code: 'auth/perfil-nao-encontrado' };
    }

    const dados = docSnap.data();

    return {
      uid: usuario.uid,
      email: usuario.email,
      tipo: dados.tipo || 'cliente',
      nome: dados.nome || 'Usuário',
    };
  } catch (erro) {
    throw erro;
  }
}

export async function sair() {
  await signOut(auth);
}

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
    case 'auth/perfil-nao-encontrado':
      return 'Perfil do usuário não encontrado no banco de dados.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}