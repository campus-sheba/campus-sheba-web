import { Address, deleteAddressAction } from "./actions";

interface Props {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AddressActions({ address, onEdit, onDelete }: Props) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this address?")) {
      await deleteAddressAction(address._id!);
      onDelete();
    }
  };
  return (
    <div className="flex gap-2">
      <button className="btn btn-xs btn-outline" onClick={onEdit}>Edit</button>
      <button className="btn btn-xs btn-error" onClick={handleDelete}>Delete</button>
    </div>
  );
}
