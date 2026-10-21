import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cores } from '../theme/barbeiro';

export default function HeaderBarbeiro({ titulo }) {
  return (
    <View style={styles.header}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Image
        source={require('../../assets/images/LOGO.png')}
        style={styles.logo}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 120,
    width: '100%',
    backgroundColor: cores.preto,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  titulo: {
    color: cores.branco,
    fontSize: 16,
    maxWidth: '60%',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2EDE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTexto: {
    color: cores.preto,
    fontWeight: 'bold',
  },
});