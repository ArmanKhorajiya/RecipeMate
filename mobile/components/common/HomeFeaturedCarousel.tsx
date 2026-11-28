import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type Recipe = {
  _id: string;
  name: string;
  category: string;
  cookingTime: number;
  image?: string;
};

type Theme = {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
  activeTab: string;
};

type Props = {
  recipes: Recipe[];
  theme: Theme;
  onRecipePress: (recipe: Recipe) => void;
};

function getRandomRecipes(recipes: Recipe[], count = 8): Recipe[] {
  const shuffled = [...recipes];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function HomeFeaturedCarousel({
  recipes,
  theme,
  onRecipePress,
}: Props) {
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);

  // Choose a new random selection after recipes load on app startup.
  useEffect(() => {
    if (recipes.length > 0) {
      setFeaturedRecipes(getRandomRecipes(recipes));
    } else {
      setFeaturedRecipes([]);
    }
  }, [recipes]);

  const shuffleFeaturedRecipes = () => {
    setFeaturedRecipes(getRandomRecipes(recipes));
  };

  if (featuredRecipes.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 22 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: "800",
            }}
          >
            Fresh Picks
          </Text>

          <Text
            style={{
              color: theme.secondaryText,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Discover something delicious
          </Text>
        </View>

        <TouchableOpacity
          onPress={shuffleFeaturedRecipes}
          accessibilityLabel="Shuffle featured recipes"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 18,
            backgroundColor: theme.activeTab,
          }}
        >
          <Text
            style={{
              color: theme.accent,
              fontSize: 12,
              fontWeight: "800",
            }}
          >
            Shuffle ↻
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={featuredRecipes}
        keyExtractor={(item) => `featured-${item._id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: 6,
          gap: 12,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => onRecipePress(item)}
            style={{
              width: 228,
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={{
                  width: "100%",
                  height: 138,
                  backgroundColor: theme.border,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 138,
                  backgroundColor: theme.activeTab,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 42 }}>🍲</Text>
              </View>
            )}

            <View style={{ padding: 13 }}>
              <Text
                numberOfLines={2}
                style={{
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: "800",
                  minHeight: 40,
                }}
              >
                {item.name}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: theme.secondaryText,
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                {item.category} · {item.cookingTime} min
              </Text>

              <Text
                style={{
                  color: theme.accent,
                  fontSize: 12,
                  fontWeight: "800",
                  marginTop: 10,
                }}
              >
                View recipe →
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
