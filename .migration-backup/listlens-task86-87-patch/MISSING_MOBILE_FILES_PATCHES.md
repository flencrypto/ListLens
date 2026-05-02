# Task #87 patches for mobile files not uploaded in this chat

These files were listed in the task but not uploaded, so apply these edits in your repo.

## 1) context/CollectionContext.tsx

Add `labelPhotos?: string[]` to the `VinylRecord` interface:

```ts
export interface VinylRecord {
  // existing fields...
  labelPhotos?: string[];
}
```

No storage change is needed if records are already saved through the existing AsyncStorage JSON path.

---

## 2) app/(tabs)/scan.tsx

Update the label scanner handler signature and add `labelPhotos` when creating the record:

```ts
const handleLabelScanned = (
  result: LabelScanResult,
  raw: RecordIdResult,
  capturedBase64: string | null,
) => {
  addRecord({
    // existing mapped fields...
    ...result,
    identificationSummary: raw,
    labelPhotos: capturedBase64 ? [capturedBase64] : [],
  });
};
```

Make sure the modal call remains compatible with the new callback:

```tsx
<LabelScannerModal
  visible={showLabelScanner}
  onClose={() => setShowLabelScanner(false)}
  onLabelIdentified={handleLabelScanned}
/>
```

---

## 3) components/RecordCard.tsx

Import `Image` if it is not already imported:

```ts
import { Image } from 'react-native';
```

Where the gradient/placeholder artwork is rendered, switch to the saved label photo when available:

```tsx
const labelPhoto = record.labelPhotos?.[0];

{labelPhoto ? (
  <Image
    source={{ uri: `data:image/jpeg;base64,${labelPhoto}` }}
    style={styles.labelThumbnail}
    resizeMode="cover"
  />
) : (
  <View style={styles.gradientPlaceholder}>{/* existing placeholder */}</View>
)}
```

Add style:

```ts
labelThumbnail: {
  width: 56,
  height: 56,
  borderRadius: 12,
  backgroundColor: '#111827',
},
```

Use the same dimensions as your current placeholder if different.

---

## 4) app/record/[id].tsx

Add imports:

```ts
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
```

Add helpers near the component:

```ts
function getResizeAction(width?: number, height?: number): ImageManipulator.Action[] {
  if (!width || !height) return [{ resize: { width: 1024 } }];
  const longestSide = Math.max(width, height);
  if (longestSide <= 1024) return [];
  return width >= height
    ? [{ resize: { width: 1024 } }]
    : [{ resize: { height: 1024 } }];
}

async function pickCompressedLabelPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
    base64: false,
  });

  const asset = picked.canceled ? null : picked.assets?.[0];
  if (!asset?.uri) return null;

  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    getResizeAction(asset.width, asset.height),
    {
      compress: 0.82,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  return manipulated.base64 ?? null;
}
```

Inside your detail component, add:

```ts
const labelPhotos = record.labelPhotos ?? [];

async function handleAddLabelPhoto() {
  const base64 = await pickCompressedLabelPhoto();
  if (!base64) return;

  updateRecord(record.id, {
    labelPhotos: [...(record.labelPhotos ?? []), base64],
  });
}
```

Render this below the header/cover block:

```tsx
<View style={styles.labelPhotosSection}>
  <View style={styles.labelPhotosHeader}>
    <Text style={styles.sectionTitle}>Label Photos</Text>
    <Pressable onPress={handleAddLabelPhoto} style={styles.addPhotoButton}>
      <Ionicons name="camera-outline" size={16} color="#67e8f9" />
      <Text style={styles.addPhotoText}>Add Photo</Text>
    </Pressable>
  </View>

  {labelPhotos.length > 0 ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.labelPhotoRow}>
      {labelPhotos.map((photo, index) => (
        <Image
          key={`${record.id}-label-${index}`}
          source={{ uri: `data:image/jpeg;base64,${photo}` }}
          style={styles.labelPhoto}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  ) : (
    <Text style={styles.emptyLabelPhotos}>No label photos saved yet.</Text>
  )}
</View>
```

Suggested styles:

```ts
labelPhotosSection: { marginTop: 20, gap: 12 },
labelPhotosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
sectionTitle: { fontSize: 18, fontWeight: '700' },
addPhotoButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#164e63' },
addPhotoText: { color: '#67e8f9', fontWeight: '700' },
labelPhotoRow: { gap: 12, paddingRight: 16 },
labelPhoto: { width: 112, height: 112, borderRadius: 16, backgroundColor: '#111827' },
emptyLabelPhotos: { opacity: 0.7 },
```
