import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

interface ScoreCardProps {
  label: string;
  score: number;
  weight?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, weight }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.scoreText}>{score}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${Math.min(100, Math.max(0, score))}%` }]} />
      </View>
      {weight && <Text style={styles.weightText}>Weight: {weight}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  track: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    backgroundColor: THEME.colors.primary,
    borderRadius: 3,
  },
  weightText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
});
