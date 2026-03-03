// import { Card, Image, Typography, Space } from "antd";
// import { CommentOutlined } from "@ant-design/icons";
// import { type Photo } from "@/lib/photos";
// import { formatDistanceToNow } from "date-fns";
// import CommentSection from "./CommentSection";

// const { Text } = Typography;

// interface PhotoCardProps {
//     photo: Photo;
//     onCommentAdded: () => void;
//     index: number;
// }

// const PhotoCard = ({ photo, onCommentAdded, index }: PhotoCardProps) => {
//     return (
//         <div
//             style={{
//                 animationDelay: `${index * 80}ms`,
//                 animationName: "fadeIn",
//                 animationDuration: "0.4s",
//                 animationFillMode: "both",
//             }}
//         >
//             <Card
//                 hoverable
//                 cover={
//                     <div style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
//                         <Image
//                             src={photo.image_url}
//                             alt="Uploaded photo"
//                             width="100%"
//                             height="100%"
//                             style={{ objectFit: "cover" }}
//                             loading="lazy"
//                         />
//                     </div>
//                 }
//                 styles={{
//                     body: { padding: 16 },
//                 }}
//             >
//                 <div
//                     style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                     }}
//                 >
//                     <Text type="secondary">
//                         {formatDistanceToNow(new Date(photo.created_at), {
//                             addSuffix: true,
//                         })}
//                     </Text>
//                     <Space size={4}>
//                         <CommentOutlined style={{ fontSize: 14 }} />
//                         <Text type="secondary">{photo.comments.length}</Text>
//                     </Space>
//                 </div>

//                 <CommentSection
//                     photoId={photo.id}
//                     comments={photo.comments}
//                     onCommentAdded={onCommentAdded}
//                 />
//             </Card>
//         </div>
//     );
// };

// export default PhotoCard;
