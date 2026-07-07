<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('role')->latest()->get(),
            'roles' => Role::orderBy('name')->get(),
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

        $data = [
            'role_id' => $request->role_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'designation' => $request->designation,
        ];

        if ($request->hasFile('signature')) {
            $data['signature'] = $request->file('signature')->store('signatures', 'public');
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

        $data = [
            'role_id' => $request->role_id,
            'name' => $request->name,
            'email' => $request->email,
            'designation' => $request->designation,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('signature')) {
            if ($user->signature && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->signature)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->signature);
            }
            $data['signature'] = $request->file('signature')->store('signatures', 'public');
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