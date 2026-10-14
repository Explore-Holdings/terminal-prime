<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('role')->latest()->get(),
            'roles' => Role::withCount('users')->orderBy('name')->get(),
            'availablePermissions' => RoleController::AVAILABLE_PERMISSIONS,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'designation' => 'nullable|string|max:255',
            'signature' => 'nullable|image|max:10240',
        ]);

        $role = Role::find($request->role_id);
        $isAgent = $role && strtolower(trim($role->name)) === 'agent';

        $data = [
            'role_id' => $request->role_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'designation' => $request->designation,
            'agent_id' => $isAgent ? User::generateNextAgentId() : null,
        ];

        if ($request->hasFile('signature')) {
            $extension = $request->file('signature')->getClientOriginalExtension();
            $filename = Str::slug($request->name) . '-signature.' . $extension;
            $data['signature'] = $request->file('signature')->storeAs('signatures', $filename, 'public');
        }

        User::create($data);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'designation' => 'nullable|string|max:255',
            'signature' => 'nullable|image|max:10240',
        ]);

        $role = Role::find($request->role_id);
        $isAgent = $role && strtolower(trim($role->name)) === 'agent';

        $data = [
            'role_id' => $request->role_id,
            'name' => $request->name,
            'email' => $request->email,
            'designation' => $request->designation,
            'agent_id' => $isAgent ? ($user->agent_id ?: User::generateNextAgentId()) : null,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('signature')) {
            if ($user->signature && Storage::disk('public')->exists($user->signature)) {
                Storage::disk('public')->delete($user->signature);
            }
            $extension = $request->file('signature')->getClientOriginalExtension();
            $filename = Str::slug($request->name) . '-signature.' . $extension;
            $data['signature'] = $request->file('signature')->storeAs('signatures', $filename, 'public');
        }

        $user->update($data);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}