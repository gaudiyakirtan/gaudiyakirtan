import { View, Text, TouchableOpacity } from "react-native";

interface ISongListItem {
    title: string;
    author?: string;
    uid: string;
    tags: string[];
}

const SongListItem = ({ title, author, uid, tags }: ISongListItem) => {
  return (
    <View className="p-2.5 bg-black">
      <View className="flex flex-col mb-2">
        <Text className="text-base font-bold text-white">{title}</Text>
        <Text className="text-sm text-gray-500">{uid}</Text>
      </View>
      <View className="flex-row flex-wrap">
        {tags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            className="px-3 py-1 mb-2 mr-2 bg-gray-800 rounded-full"
          >
            <Text className="text-xs text-white">{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SongListItem;
