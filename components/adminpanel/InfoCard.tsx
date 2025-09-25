import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../constants/colors';

interface InfoCardProps {
  label: string;
  value: string | number;
  trend?: string; // opcional
  backgroundColor?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value, trend, backgroundColor }) => {
  return (
    <View style={[styles.card, backgroundColor ? { backgroundColor } : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend && <Text style={styles.trend}>{trend}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '43%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    margin: 6,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark,
  },
  trend: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default InfoCard;
