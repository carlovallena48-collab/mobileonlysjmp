import React from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

const Colors = {
    primary: '#1e3a8a',
    background: '#f8fafc',
};

const ScreenLayout = ({ 
    children, 
    navigation, 
    activeRoute,
    showHeader = true,
    showBottomNav = true,
    headerProps = {},
    scrollable = true,
    style = {}
}) => {
    const renderContent = () => {
        if (scrollable) {
            return (
                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    style={[styles.scrollView, style]}
                    contentContainerStyle={styles.scrollContent}
                >
                    {children}
                </ScrollView>
            );
        }
        
        return (
            <View style={[styles.content, style]}>
                {children}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.primary} />
            
            {showHeader && (
                <Header navigation={navigation} {...headerProps} />
            )}
            
            <View style={styles.container}>
                {renderContent()}
            </View>

            {showBottomNav && (
                <BottomNavigation navigation={navigation} activeRoute={activeRoute} />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
    },
});

export default ScreenLayout;