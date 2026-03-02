// Écran des conversations
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Loading, EmptyState } from '../components/common';
import { conversationsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const ConversationsScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuthStore();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const data = await conversationsAPI.getAll();
      setConversations(data.data || data || []);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('Chat', { 
      conversationId: conversation.id,
      listing: conversation.listing,
      otherUser: getOtherUser(conversation),
    });
  };

  const getOtherUser = (conversation) => {
    if (conversation.buyer?.id === user?.id) {
      return conversation.seller;
    }
    return conversation.buyer;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <EmptyState
          icon="chatbubbles-outline"
          title="Connectez-vous"
          message="Connectez-vous pour voir vos messages."
          actionLabel="Se connecter"
          onAction={() => navigation.navigate('Auth')}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return <Loading fullScreen message="Chargement des messages..." />;
  }

  const renderConversation = ({ item }) => {
    const otherUser = getOtherUser(item);
    const lastMessage = item.last_message || item.lastMessage;
    const hasUnread = item.unread_count > 0 || item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationItem, hasUnread && styles.conversationUnread]}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          {otherUser?.avatar ? (
            <Image source={{ uri: otherUser.avatar }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={24} color={COLORS.textSecondary} />
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.textBold]} numberOfLines={1}>
              {otherUser?.name || 'Utilisateur'}
            </Text>
            <Text style={styles.time}>{formatDate(lastMessage?.created_at || item.updated_at)}</Text>
          </View>

          {item.listing && (
            <Text style={styles.listingTitle} numberOfLines={1}>
              {item.listing.title}
            </Text>
          )}

          <Text style={[styles.lastMessage, hasUnread && styles.textBold]} numberOfLines={1}>
            {lastMessage?.content || 'Aucun message'}
          </Text>
        </View>

        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {item.unread_count || item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderConversation}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Aucune conversation"
            message="Vous n'avez pas encore de messages."
            actionLabel="Parcourir les annonces"
            onAction={() => navigation.navigate('Home')}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  conversationUnread: {
    backgroundColor: COLORS.primaryLight + '10',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
  },
  time: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  listingTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  textBold: {
    fontWeight: '600',
    color: COLORS.text,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: SPACING.sm,
  },
  unreadCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 78,
  },
});

export default ConversationsScreen;
