import { useState } from "react";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import { CheckListItemEntity } from "../types";
import { useUpdateCheckListItem } from "../hooks/useCheckListItemMutations";
import { useToast } from "../../../contexts/ToastContext";

type CheckListItemEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: CheckListItemEntity;
  checkListSetId: string;
  onSuccess: () => void;
};

/**
 * チェックリスト項目編集モーダル
 */
export default function CheckListItemEditModal({
  isOpen,
  onClose,
  item,
  checkListSetId,
  onSuccess,
}: CheckListItemEditModalProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  // コンポーネントのトップレベルでフックを呼び出す
  const {
    updateCheckListItem,
    status: updateStatus,
    error: updateError,
  } = useUpdateCheckListItem(checkListSetId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("名前は必須です");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCheckListItem(item.id, {
        name: formData.name,
        description: formData.description,
      });
      addToast("チェックリスト項目を更新しました", "success");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("項目の更新に失敗しました", err);
      setError("項目の更新に失敗しました。もう一度お試しください。");
      addToast("チェックリスト項目の更新に失敗しました", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="チェックリスト項目の編集"
      size="md">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-md border border-red bg-red/10 p-3 text-red">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label
            htmlFor="name"
            className="mb-2 block font-medium text-aws-squid-ink-light">
            名前 <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aws-sea-blue-light ${
              !formData.name.trim() ? "border-red" : "border-light-gray"
            }`}
            placeholder="チェック項目の名前"
            required
          />
          {!formData.name.trim() && (
            <p className="mt-1 text-sm text-red">名前は必須です</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="mb-2 block font-medium text-aws-squid-ink-light">
            説明
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-light-gray px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aws-sea-blue-light"
            placeholder="チェック項目の説明"
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button outline onClick={onClose} type="button">
            キャンセル
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "更新中..." : "更新"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
