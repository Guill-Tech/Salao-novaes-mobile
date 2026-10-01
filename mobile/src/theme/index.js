import { Platform } from 'react-native';

// Cores aproximadas do Figma. Confira os hex exatos clicando em cada
// elemento no Figma (painel direito -> Preenchimento) e ajuste aqui.
export const colors = {
  primary: '#6B0F12',      // vinho dos botões
  primaryLight: '#8E1B1F', // borda/realce do botão
  background: '#140808',   // fundo escuro das telas de login/cadastro
  surface: '#FFFFFF',      // fundo das telas internas
  inputBg: '#BDBDBD',      // campos de texto
  text: '#FFFFFF',         // texto sobre fundo escuro
  textDark: '#1A1A1A',     // texto sobre fundo claro
  error: '#FF6B6B',
};

export const fonts = {
  // O Figma usa uma fonte com serifa; estas são as nativas de cada sistema.
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 6, md: 12, pill: 999 };
